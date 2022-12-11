function capitalizeFirstLetter(strings) {
    return strings.map(string => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    });
}

module.exports = {capitalizeFirstLetter};