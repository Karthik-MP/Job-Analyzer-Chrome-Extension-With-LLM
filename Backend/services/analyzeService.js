

const checkVisaRequirements = (jobRequirements, userVisaStatus) => {
  const sponsorshipOffered = jobRequirements.sponsorship
    .toLowerCase()
    .includes("yes");
  const requiresUSCitizen = jobRequirements.workAuthorization
    .toLowerCase()
    .includes("yes");

  if (userVisaStatus === "citizen") return { match: true, status: "Eligible" };

  if (requiresUSCitizen) {
    return { match: false, status: "US Citizens Only" };
  }

  if (userVisaStatus === "f1" && !sponsorshipOffered) {
    return { match: false, status: "No Sponsorship" };
  }

  return {
    match: sponsorshipOffered,
    status: sponsorshipOffered ? "Sponsorship Available" : "No Sponsorship",
  };
};


module.exports = {
  checkVisaRequirements,
};
