const http = require("node:http");
const https = require("node:https");

const sendHttpRequest = (options) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (buffer) => {
        data += buffer;
      });
      res.on("end", () => {
        data = JSON.parse(data.toString().trim());
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`Error code: ${res.statusCode}.`));
      });
      res.on("error", (error) => {
        reject(new Error(error));
      });
    });

    req.end();
  });
};

const sendHttpsRequest = (options) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (buffer) => {
        data += buffer;
      });
      res.on("end", () => {
        // data = JSON.parse(data.toString().trim());
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`Error code: ${res.statusCode}.`));
      });
      res.on("error", (error) => {
        reject(new Error(error));
      });
    });

    req.end();
  });
};

module.exports = { sendHttpRequest, sendHttpsRequest };
