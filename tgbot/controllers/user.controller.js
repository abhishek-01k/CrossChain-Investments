const { BASE_URL } = require("../constants");
const fs = require("fs");
const getContributedBtsData = async (page, limit, address) => {
  const url = `${BASE_URL}/portfolio/contributed-bts?page=${page}&limit=${limit}&address=${address}`;

  const res = await fetch(url);
  const response = await res.json();

  const { users } = response.data;

  // It generates a key value pair
  const btsData = users.reduce((acc, user) => {
    acc[user.bts] = {
      btsDetails: user.btsDetails, // details of the bts contributed to
      lpBalanceNumeric: user.lpBalanceNumeric, // Balance of the LP token that the user has
      usertotalBalance: user.totalBalance, // Total balance of the user
      btsUSDValue: user.btsDetails.price[0].usd, // Total value of the BTS in $
      last24hourPriceChange: user.btsDetails["24hourPriceChange"], // % of change in the BTS value in last 24hr
    };
    return acc;
  }, {});

  return btsData;
};

const checkContributedBTS = async (address) => {
  const contributedBts = await getContributedBtsData(1, 10, address);

  // fs.writeFileSync(
  //   `public/${address}.json`,
  //   JSON.stringify(contributedBts, null, 2)
  // );

  return contributedBts;
};

const usersBTSData = async (page, limit, address) => {
  const url = `${BASE_URL}/portfolio/created-bts?page=${page}&limit=${limit}&address=${address}`;

  const res = await fetch(url);
  const response = await res.json();

  const { users } = response;

  const btsData = users.reduce((acc, user) => {
    acc[user.bts] = {
      btsDetails: user.btsDetails, // details of the bts contributed to
    };
    return acc;
  }, {});

  return btsData;
};

const getUserBTSData = async (start, end, address) => {
  const btsDataOfuser = await usersBTSData(start, end, address);

  // fs.writeFileSync(
  //   `public/created-bts/${address}.json`,
  //   JSON.stringify(btsDataOfuser, null, 2)
  // );
  return btsDataOfuser;
};

module.exports = { checkContributedBTS, getUserBTSData };
