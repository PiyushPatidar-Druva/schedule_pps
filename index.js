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

document.addEventListener("DOMContentLoaded", function () {
  // Attach event listener to the "Update" button
  document
    .getElementById("showVerificationTimes")
    .addEventListener("click", function () {
      toggleVerificationTimes();
    });
});

function convertISTtoUTC(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setUTCHours(hours - 5, minutes - 30);
  return `${String(date.getUTCMinutes()).padStart(2, "0")} ${String(
    date.getUTCHours()
  ).padStart(2, "0")}`;
}

function updateTextAreaValue(fullContent, cloudType, stringToReplace) {
  // Define the regex pattern for matching content between start and end markers
  const regexPattern = {
    "Mainline dep1":
      /# <----- PPS Mainline DEP1 Starts([\s\S]*?)#PPS Mainline DEP1 Ends  ----->/g,
    "Mainline dep0":
      /# <----- PPS Mainline DEP0 Starts([\s\S]*?)#PPS Mainline DEP0 Ends  ----->/g,
    Gov: /# <----- PPS Gov DEP0 Starts([\s\S]*?)#PPS Gov DEP0 Ends  ----->/g,
  };

  // Use regex to find and replace the content in the selected section
  let updatedContent = fullContent;

  // Replace the content based on the selected deployment option
  updatedContent = updatedContent.replace(
    regexPattern[cloudType],
    (match, p1) => {
      // Replace the content between the start and end markers with the new data
      return match.replace(p1, stringToReplace);
    }
  );

  // Send a message to the content script to replace the textarea value
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        action: "replaceTextarea",
        newValue: updatedContent,
      },
      function (response) {
        if (response.success) {
          console.log(response.message);
        } else {
          console.error(response.message);
        }
      }
    );
  });
}

document
  .getElementById("taskForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

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
      output += `#${task.summaryLabel.toLowerCase()} at ${task.istTime}\n`;
      output +=
        (isUncommentedSchedules ? "" : "#") +
        `${task.time} * * 1-5%TASK_TYPE=${task.taskType};CLOUD_TYPE=${cloudTypeFormatted};DEPLOYMENT_ID=${deploymentId};TEST_PLAN_ID=${testPlanId};CP_LABEL=${cpLabel},${labels}`;
      if (task.fixture) {
        output += `;DASHBOARD_DATA_GENERATION_FIXTURE=${baseUrl}${task.fixture}/artifact/ui-automation/cypress/dataPreparationDetails.json`;
      }
      output += `;TEST_PLAN_SUMMARY_LABEL=${task.summaryLabel}\n\n`;
    });

    // Send a message to the content script to get the current value of the textarea
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "getTextareaValue",
        },
        function (response) {
          if (response.success) {
            let fullContent = response.value;
            updateTextAreaValue(fullContent, cloudType, output);
          } else {
            console.error(response.message);
            document.getElementById("currentValue").textContent =
              "Textarea not found";
          }
        }
      );
    });
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
