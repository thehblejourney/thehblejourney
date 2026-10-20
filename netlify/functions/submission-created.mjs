const HUBSPOT_API = "https://api.hubapi.com";
const HBLE_FORM_NAME = "hble-project-inquiry";
const HBLE_PIPELINE_ID = "default";
const HBLE_NEW_INQUIRY_STAGE_ID = "4472280799";

const PROJECT_TYPE_MAP = {
  "Music Video": "cinematic_production",
  "Commercial / Brand Film": "cinematic_production",
  "Social Campaign": "social_video",
  "Business Promo": "signature_video_edit",
  "AI-Enhanced Visual Project": "cinematic_production",
  "Other": "other",
};

const BUDGET_MAP = {
  "$750–$1,500 USD": "750_1499",
  "$1,500–$3,500 USD": "1500_3499",
  "$3,500–$6,500 USD": "3500_4999",
  "$6,500–$10,000+ USD": "5000_plus",
};

const NON_SALES_TYPES = new Set([
  "Existing Client Support",
  "Billing / Payment Question",
]);

function getAccessToken() {
  return process.env.HUBSPOT_SERVICE_KEY || process.env.HUBSPOT_ACCESS_TOKEN;
}

async function hubspot(path, options = {}) {
  const token = getAccessToken();
  if (!token) {
    throw new Error(
      "Missing HUBSPOT_SERVICE_KEY (or HUBSPOT_ACCESS_TOKEN) Netlify environment variable."
    );
  }

  const response = await fetch(`${HUBSPOT_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HubSpot ${response.status} ${path}: ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function splitName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(" "),
  };
}

function compactProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

async function upsertContact(data) {
  const email = String(data.email || "").trim().toLowerCase();
  if (!email) throw new Error("HBLE form submission is missing an email address.");

  const { firstname, lastname } = splitName(data.name);
  const contactProperties = compactProperties({
    email,
    firstname,
    lastname,
    company: String(data.company || "").trim(),
  });

  const search = await hubspot("/crm/v3/objects/contacts/search", {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["email", "firstname", "lastname", "company"],
      limit: 1,
    }),
  });

  if (search.results?.length) {
    const contactId = search.results[0].id;
    await hubspot(`/crm/v3/objects/contacts/${contactId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: contactProperties }),
    });
    return contactId;
  }

  const created = await hubspot("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties: contactProperties }),
  });

  return created.id;
}

async function getDealToContactAssociationType() {
  const labels = await hubspot("/crm/v4/associations/deals/contacts/labels");
  const results = labels.results || [];

  const preferred =
    results.find((item) =>
      ["deal_to_contact", "Deal to contact"].includes(item.label)
    ) ||
    results.find((item) => !item.label) ||
    results.find((item) =>
      ["HUBSPOT_DEFINED", "hubspotDefined"].includes(
        item.category || item.associationCategory
      )
    ) ||
    results[0];

  if (!preferred) {
    throw new Error("Could not resolve the HubSpot deal-to-contact association type.");
  }

  return Number(preferred.typeId || preferred.associationTypeId);
}

function buildDealDescription(data, submission) {
  const rows = [
    ["Website form", HBLE_FORM_NAME],
    ["Name", data.name],
    ["Email", data.email],
    ["Company / Artist", data.company],
    ["Project / Support Type", data["project-type"]],
    ["Estimated Budget", data.budget],
    ["Desired Timeline", data.timeline],
    ["Project Details", data.message],
    ["Netlify Submission ID", submission.id],
  ];

  return rows
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => `${label}: ${String(value).trim()}`)
    .join("\n");
}

async function createDeal(data, submission, contactId) {
  const projectLabel = String(data["project-type"] || "Other").trim();
  const mappedProjectType = PROJECT_TYPE_MAP[projectLabel] || "other";
  const mappedBudget = BUDGET_MAP[String(data.budget || "").trim()];
  const clientName = String(data.company || data.name || data.email || "Website Lead").trim();

  const properties = compactProperties({
    dealname: `${clientName} — ${projectLabel}`,
    pipeline: HBLE_PIPELINE_ID,
    dealstage: HBLE_NEW_INQUIRY_STAGE_ID,
    description: buildDealDescription(data, submission),
    hble_project_type: mappedProjectType,
    hble_budget_range: mappedBudget,
    hble_lead_source: "hble_website",
  });

  const associationTypeId = await getDealToContactAssociationType();

  return hubspot("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({
      properties,
      associations: [
        {
          to: { id: String(contactId) },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId,
            },
          ],
        },
      ],
    }),
  });
}

export default async (request) => {
  try {
    const eventBody = await request.json();
    const submission = eventBody.payload || eventBody;
    const data = submission.data || {};
    const formName =
      submission.form_name ||
      submission.formName ||
      data["form-name"] ||
      "";

    if (formName !== HBLE_FORM_NAME) {
      return new Response(null, { status: 200 });
    }

    const contactId = await upsertContact(data);
    const projectLabel = String(data["project-type"] || "").trim();

    if (!NON_SALES_TYPES.has(projectLabel)) {
      const deal = await createDeal(data, submission, contactId);
      console.log(
        `HBLE CRM sync complete: contact ${contactId}, deal ${deal.id}, submission ${submission.id || "unknown"}`
      );
    } else {
      console.log(
        `HBLE CRM contact sync complete for non-sales inquiry: contact ${contactId}, submission ${submission.id || "unknown"}`
      );
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("HBLE HubSpot CRM sync failed:", error);
    return new Response(null, { status: 500 });
  }
};
