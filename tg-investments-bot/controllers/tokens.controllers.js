const { BASE_URL } = require("../constants");
const fs = require("fs");

const fetchTrendingTokens = async (page, limit, sortBy, sortOrder) => {
  const url = `${BASE_URL}/bts?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  const res = await fetch(url);
  const response = await res.json();
  const { docs } = response;

  // Send only top 5 BTS token
  const BTSData = docs.length > 5 ? docs.slice(0, 5) : docs;
  return BTSData;
};

const trendingtokendetails = async () => {
  const topTrendingToken = await fetchTrendingTokens(
    1,
    10,
    "24hourPriceChange",
    -1
  );
  // It creates a file in the public folder
  // fs.writeFileSync(
  //   `public/topTrendingToken.json`,
  //   JSON.stringify(topTrendingToken, null, 2)
  // );

  return topTrendingToken;
};

const loosingtokendetails = async () => {
  const losingToken = await fetchTrendingTokens(1, 10, "24hourPriceChange", 1);

  // fs.writeFileSync(
  //   `public/losingToken.json`,
  //   JSON.stringify(losingToken, null, 2)
  // );

  return losingToken;
};

module.exports = { trendingtokendetails, loosingtokendetails };
