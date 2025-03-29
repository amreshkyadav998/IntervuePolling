
export const getVariant = (successRate) => {
  console.log("successRate: ", successRate);
  if (successRate <= 30) {
    return "danger";
  } else if (successRate > 30 && successRate <= 50) {
    return "warning";
  } else if (successRate > 50 && successRate <= 70) {
    return "info";
  } else if (successRate > 70) {
    return "success";
  }
};
