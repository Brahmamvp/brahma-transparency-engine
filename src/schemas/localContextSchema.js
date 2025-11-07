// src/schemas/localContextSchema.js

const localContextSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Local Context Schema",
  description:
    "Ambient environmental schema used by the Local Navigator Agent (LNA) and Environment Checker.",
  type: "object",
  properties: {
    userLocale: {
      type: "object",
      description: "General geographic locality (anonymized)",
      properties: {
        zipPrefix: { type: "string" },
        regionName: { type: "string" },
        lastUpdated: { type: "string", format: "date-time" },
      },
    },
    logisticalFriction: {
      type: "array",
      description: "Local transportation, time, energy, or cost burdens",
      items: {
        type: "object",
        properties: {
          tag: {
            type: "string",
            enum: ["transit_access", "traffic_congestion", "commute_time"],
          },
          value: { type: "number" },
        },
      },
    },
    culturalSpecificity: {
      type: "array",
      description: "Cultural alignment or mismatch indicators",
      items: {
        type: "object",
        properties: {
          tag: {
            type: "string",
            enum: ["cultural_business_focus", "community_support"],
          },
          satisfaction: { type: "number" },
          description: { type: "string" },
        },
      },
    },
    economicConstraints: {
      type: "array",
      description: "Local opportunity or economic friction data",
      items: {
        type: "object",
        properties: {
          tag: {
            type: "string",
            enum: ["industry_ceiling", "upward_mobility"],
          },
          impactScore: { type: "number" },
        },
      },
    },
  },
};

export default localContextSchema;