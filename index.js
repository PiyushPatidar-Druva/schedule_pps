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
        dashboardTime: "16:50",
        dellBrandingTime: "17:05",
        platformTime: "17:15",
        nasTime: "18:00",
        oracledtcTime: "19:00",
        mssqlTime: "19:10",
        vmwareTime: "19:20",
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
        taskType: "vmwareVerification",
        time: taskTimesUTC.vmwareTime,
        istTime: taskTimes.vmwareTime,
        summaryLabel: "VMware",
      },
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
    ];

    let output = "";
    tasks.forEach((task) => {
      output += `#PPS ${cloudType} ${task.summaryLabel.toLowerCase()} at ${
        task.istTime
      }\n`;
      output += `${task.time} * * 1-5%TASK_TYPE=${task.taskType};CLOUD_TYPE=${cloudTypeFormatted};DEPLOYMENT_ID=${deploymentId};TEST_PLAN_ID=${testPlanId};CP_LABEL=${cpLabel},${labels}`;
      if (task.fixture) {
        output += `;DASHBOARD_DATA_GENERATION_FIXTURE=${baseUrl}${task.fixture}/artifact/ui-automation/cypress/dataPreparationDetails.json`;
      }
      output += `;TEST_PLAN_SUMMARY_LABEL=${task.summaryLabel}\n\n`;
    });

    document.getElementById("output").textContent = output;
  });

document.getElementById("taskForm").addEventListener("reset", function () {
  document.getElementById("output").textContent = "";
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
