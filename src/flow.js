export async function getNextScreen(decryptedBody) {
  const {
    action,
    screen,
    data
  } = decryptedBody;

  console.log("Action:", action);
  console.log("Screen:", screen);
  console.log("Data:", data);

  // First time the Flow opens
  if (action === "INIT") {
    return {
      screen: "START",
      data: {}
    };
  }

  // START screen - YES / NO decision
  if (
    screen === "START" &&
    action === "data_exchange"
  ) {
    const hasProperty =
      data?.has_property ||
      data?.form?.has_property;

    if (hasProperty === "yes" || hasProperty === "YES") {
      return {
        screen: "PROPERTY_TYPE",
        data: {}
      };
    }

    if (hasProperty === "no" || hasProperty === "NO") {
      return {
        screen: "NO_PROPERTY",
        data: {}
      };
    }

    return {
      screen: "START",
      data: {}
    };
  }

  // Property Type
  if (screen === "PROPERTY_TYPE") {
    return {
      screen: "LOCATION",
      data: {}
    };
  }

  // Location
  if (screen === "LOCATION") {
    return {
      screen: "BEDROOMS",
      data: {}
    };
  }

  // Bedrooms
  if (screen === "BEDROOMS") {
    return {
      screen: "FURNISHED",
      data: {}
    };
  }

  // Furnished
  if (screen === "FURNISHED") {
    return {
      screen: "AVAILABILITY",
      data: {}
    };
  }

  // Availability
  if (screen === "AVAILABILITY") {
    return {
      screen: "OWNER_DETAILS",
      data: {}
    };
  }

  // Owner Details
  if (screen === "OWNER_DETAILS") {
    return {
      screen: "DOCUMENTS",
      data: {}
    };
  }

  // Documents
  if (screen === "DOCUMENTS") {
    return {
      screen: "THANK_YOU",
      data: {}
    };
  }

  // Default
  return {
    screen: "START",
    data: {}
  };
}
