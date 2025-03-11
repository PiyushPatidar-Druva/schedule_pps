function setIsLoading(isLoading) {
  if (isLoading) {
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("loader").classList.add("show");
    document.querySelector(".container").classList.add("loader-container");
  } else {
    document.getElementById("loader").classList.remove("show");
    document.getElementById("loader").classList.add("hidden");
    document.querySelector(".container").classList.remove("loader-container");
  }
}

async function getSchedule(jobName = "UI-Automation-PPS-Pipeline") {
  setIsLoading(true);
  // Jenkins job URL and API endpoint
  const jenkinsUrl = `http://staging-jarvis.druva.org:8080/job/${jobName}/config.xml`;

  // Create basic authentication header
  const auth = btoa(window.env.username + ":" + window.env.apiToken);

  try {
    // Step 1: Fetch the current Jenkins job configuration (GET request)
    const response = await fetch(jenkinsUrl, {
      method: "GET",
      headers: {
        Authorization: "Basic " + auth,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching config: ${response.statusText}`);
    }

    // Step 2: Get the XML response as text
    let xmlText = await response.text();
    const parameterizedSpecification = xmlText.match(
      /<parameterizedSpecification>([\s\S]*?)<\/parameterizedSpecification>/g
    );
    const extractedText = parameterizedSpecification[0]
      .replace("<parameterizedSpecification>", "")
      .replace("</parameterizedSpecification>", "");

    setIsLoading(false);
    return { extractedText, xmlText };
  } catch (error) {
    setIsLoading(false);
  }
}

async function pushSchedule(
  jobName = "Test-UI-Automation-PPS-Pipeline",
  modifiedXml
) {
  // Jenkins job URL and API endpoint
  const jenkinsUrl = `http://staging-jarvis.druva.org:8080/job/${jobName}/config.xml`;

  // Create basic authentication header
  const auth = btoa(window.env.username + ":" + window.env.apiToken);

  try {
    // Send the POST request using fetch
    const response = await fetch(jenkinsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        Authorization: "Basic " + auth,
      },
      body: modifiedXml,
    });
    setIsLoading(false);
  } catch (error) {
    setIsLoading(false);
  }
}

async function updateJenkinsConfig() {
  const jobName = document.getElementById("jobName").value;
  const updatedContent = document.getElementById("output").innerHTML;
  if (updatedContent) {
    const jobContent = await getSchedule(jobName);
    const modifiedXml = jobContent.xmlText.replace(
      /(<parameterizedSpecification>)([\s\S]*?)(<\/parameterizedSpecification>)/,
      `$1${updatedContent}$3`
    );
    await pushSchedule(jobName, modifiedXml);
  }
}

function toggleVerificationTimes(display) {
  const verificationTimes = document.getElementById("verificationTimes");
  const convertIstToUtcLabel = document.getElementById("convertIstToUtcLabel");
  if (display) {
    verificationTimes.style.display = display;
    convertIstToUtcLabel.style.display = display;
  } else {
    verificationTimes.style.display =
      verificationTimes.style.display !== "block" ? "block" : "none";
    convertIstToUtcLabel.style.display =
      convertIstToUtcLabel.style.display !== "block" ? "block" : "none";
  }
}

function convertISTtoUTC(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setUTCHours(hours - 5, minutes - 30);
  return `${String(date.getUTCMinutes()).padStart(2, "0")} ${String(
    date.getUTCHours()
  ).padStart(2, "0")}`;
}

function getUpdatedTextValue(fullContent, cloudType, stringToReplace) {
  // Define the regex pattern for matching content between start and end markers
  const regexPattern = {
    "Mainline dep1":
      /# &lt;----- PPS Mainline DEP1 Starts([\s\S]*?)#PPS Mainline DEP1 Ends  -----&gt;/g,
    "Mainline dep0":
      /# &lt;----- PPS Mainline DEP0 Starts([\s\S]*?)#PPS Mainline DEP0 Ends  -----&gt;/g,
    Gov: /# &lt;----- PPS Gov DEP0 Starts([\s\S]*?)#PPS Gov DEP0 Ends  -----&gt;/g,
  };

  // Use regex to find and replace the content in the selected section
  let updatedContent = fullContent;

  console.log(regexPattern[cloudType]);
  console.log(updatedContent);
  // Replace the content based on the selected deployment option
  updatedContent = updatedContent.replace(
    regexPattern[cloudType],
    (match, p1) => {
      // Replace the content between the start and end markers with the new data

      return match.replace(p1, stringToReplace);
    }
  );

  return updatedContent;
}

document
  .getElementById("taskForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    setIsLoading(true);

    const cpLabel = document.getElementById("cpLabel").value;
    const testPlanId = document.getElementById("testPlanId").value;
    const cloudType = document.getElementById("cloudType").value;
    const dashboardDataFixture = document.getElementById(
      "dashboardDataFixture"
    ).value;
    const isConvertIstToUtcFlag =
      document.getElementById("convertIstToUtc").checked;

    const defaultCloudSpecificDetails = {
      "Mainline dep1": {
        dashboardTime: "02:00",
        dellBrandingTime: "02:15",
        platformTime: "02:20",
        nasTime: "03:00",
        oracledtcTime: "04:00",
        mssqlTime: "04:15",
        vmwareTime: "04:30",
        defaultLabels: "deployment-1-ap1",
      },
      "Mainline dep0": {
        dashboardTime: "14:30",
        dellBrandingTime: "14:45",
        platformTime: "14:55",
        nasTime: "15:30",
        oracledtcTime: "16:30",
        mssqlTime: "16:40",
        vmwareTime: "16:50",
        defaultLabels: "deployment-0-us0",
      },
      Gov: {
        dashboardTime: "17:50",
        dellBrandingTime: "18:05",
        platformTime: "18:15",
        nasTime: "19:00",
        oracledtcTime: "20:00",
        mssqlTime: "20:10",
        vmwareTime: "20:20",
        defaultLabels: "prod_gov",
      },
    };

    const times = [
      "dashboardTime",
      "dellBrandingTime",
      "platformTime",
      "nasTime",
      "oracledtcTime",
      "mssqlTime",
      "vmwareTime",
    ];
    const taskTimes = times.reduce((acc, time) => {
      acc[time] =
        document.getElementById(time).value ||
        defaultCloudSpecificDetails[cloudType][time];
      return acc;
    }, {});

    const labels = defaultCloudSpecificDetails[cloudType].defaultLabels;

    const taskTimesUTC = Object.keys(taskTimes).reduce((acc, time) => {
      if (isConvertIstToUtcFlag) {
        acc[time] = convertISTtoUTC(taskTimes[time]);
      } else {
        acc[time] = taskTimes[time];
      }
      return acc;
    }, {});

    const deploymentId = cloudType.includes("dep1") ? "1" : "0";
    const cloudTypeFormatted = cloudType.includes("Mainline")
      ? "mainline"
      : "gov";
    const baseUrl =
      "http://staging-jarvis.druva.org:8080/job/UI-Automation-PPS-Generic-Tasks/";

    const tasks = [
      {
        taskType: "dashboardVerification",
        time: taskTimesUTC.dashboardTime,
        istTime: taskTimes.dashboardTime,
        summaryLabel: "Dashboard",
        fixture: dashboardDataFixture,
      },
      {
        taskType: "dellBrandingVerification",
        time: taskTimesUTC.dellBrandingTime,
        istTime: taskTimes.dellBrandingTime,
        summaryLabel: "DellBranding",
      },
      {
        taskType: "platformVerification",
        time: taskTimesUTC.platformTime,
        istTime: taskTimes.platformTime,
        summaryLabel: "Platform",
      },
      {
        taskType: "nasVerification",
        time: taskTimesUTC.nasTime,
        istTime: taskTimes.nasTime,
        summaryLabel: "NAS",
      },
      {
        taskType: "oracledtcVerification",
        time: taskTimesUTC.oracledtcTime,
        istTime: taskTimes.oracledtcTime,
        summaryLabel: "OracleDTC",
      },
      {
        taskType: "mssqlVerification",
        time: taskTimesUTC.mssqlTime,
        istTime: taskTimes.mssqlTime,
        summaryLabel: "MSSQL",
      },
      {
        taskType: "vmwareVerification",
        time: taskTimesUTC.vmwareTime,
        istTime: taskTimes.vmwareTime,
        summaryLabel: "VMware",
      },
    ];

    let output = "\n\n";
    const isUncommentedSchedules = document.getElementById(
      "unCommentedSchedules"
    ).checked;
    tasks.forEach((task) => {
      let commentSchedule = !isUncommentedSchedules;
      if (!document.getElementById(task.taskType).checked) {
        commentSchedule = true;
      }
      output += `#${task.summaryLabel.toLowerCase()} at ${task.istTime}\n`;
      output +=
        (!commentSchedule ? "" : "#") +
        `${task.time} * * 1-5%TASK_TYPE=${task.taskType};CLOUD_TYPE=${cloudTypeFormatted};DEPLOYMENT_ID=${deploymentId};TEST_PLAN_ID=${testPlanId};CP_LABEL=${cpLabel},${labels}`;
      if (task.fixture) {
        output += `;DASHBOARD_DATA_GENERATION_FIXTURE=${baseUrl}${task.fixture}/artifact/ui-automation/cypress/dataPreparationDetails.json`;
      }
      output += `;TEST_PLAN_SUMMARY_LABEL=${task.summaryLabel}\n\n`;
    });

    const jobName = document.getElementById("jobName").value;
    const jobContent = await getSchedule(jobName);

    const updatedContent = getUpdatedTextValue(
      jobContent.extractedText,
      cloudType,
      output
    );

    document.getElementById("output").innerHTML = updatedContent;

    // Step 3: Modify the XML (For example, replace a parameter value)
    // Use a regular expression to replace the <myParameter> value in the XML
    const modifiedXml = jobContent.xmlText.replace(
      /(<parameterizedSpecification>)([\s\S]*?)(<\/parameterizedSpecification>)/,
      `$1${updatedContent}$3`
    );
    // await pushSchedule(jobName, modifiedXml);
  });

document.getElementById("taskForm").addEventListener("reset", function () {
  toggleVerificationTimes("none");
});

function copyOutput() {
  const outputElement = document.getElementById("output");
  const range = document.createRange();
  range.selectNode(outputElement);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
  alert("Output copied to clipboard!");
}

document.addEventListener("DOMContentLoaded", async function () {
  let username = localStorage.getItem("username");
  let apiToken = localStorage.getItem("apiToken");
  if (!username && !apiToken) {
    // Prompt the user for username and password
    username = prompt("Please enter your username:");
    password = prompt("Please enter your password:");
    localStorage.setItem("username", username);
    localStorage.setItem("apiToken", password);
  }

  // Store the credentials in the env object
  window.env = {
    username,
    apiToken,
  };

  const jobName = document.getElementById("jobName").value;
  const jobContent = await getSchedule(jobName);
  document.getElementById("output").innerHTML = jobContent.extractedText;

  // Attach event listener to the "Update" button
  document
    .getElementById("showVerificationTimes")
    .addEventListener("click", function () {
      toggleVerificationTimes();
    });
});
