function capitalizeFirstLetter(strings) {
    return strings.map(string => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    });
}

function chooseRandomValues(arr, num) {
  const result = [];
  const selectedValues = new Set();
  while (result.length < num) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    const randomValue = arr[randomIndex];
    if (!selectedValues.has(randomValue)) {
      result.push(randomValue);
      selectedValues.add(randomValue);
    }
  }
  return result;
}


module.exports = {capitalizeFirstLetter, chooseRandomValues};