function toggleVerificationTimes() {
  const verificationTimes = document.getElementById("verificationTimes");
  verificationTimes.style.display =
    verificationTimes.style.display !== "block" ? "block" : "none";
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

    const defaultTimes = {
      "Mainline dep1": {
        vmwareTime: "00:00",
        dashboardTime: "02:00",
        dellBrandingTime: "02:30",
        platformTime: "03:00",
        nasTime: "06:00",
        oracledtcTime: "07:30",
        mssqlTime: "09:15",
      },
      "Mainline dep0": {
        dellBrandingTime: "15:00",
        platformTime: "15:15",
        dashboardTime: "15:45",
        vmwareTime: "16:00",
        nasTime: "17:00",
        oracledtcTime: "18:00",
        mssqlTime: "19:00",
      },
      Gov: {
        dellBrandingTime: "19:30",
        platformTime: "19:15",
        dashboardTime: "19:45",
        vmwareTime: "20:00",
        nasTime: "21:00",
        oracledtcTime: "22:00",
        mssqlTime: "23:00",
      },
    };

    const times = [
      "vmwareTime",
      "dashboardTime",
      "dellBrandingTime",
      "platformTime",
      "nasTime",
      "oracledtcTime",
      "mssqlTime",
    ];
    const taskTimes = times.reduce((acc, time) => {
      acc[time] =
        document.getElementById(time).value || defaultTimes[cloudType][time];
      return acc;
    }, {});

    const taskTimesUTC = Object.keys(taskTimes).reduce((acc, time) => {
      acc[time] = convertISTtoUTC(taskTimes[time]);
      return acc;
    }, {});

    const deploymentId = cloudType.includes("dep1") ? "1" : "0";
    const cloudTypeFormatted = cloudType.includes("Mainline")
      ? "Mainline"
      : "Gov";
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
      output += `#PPS ${cloudType} ${task.summaryLabel.toLowerCase()} ${cloudTypeFormatted} at ${
        task.istTime
      }\n`;
      output += `#${task.time} * * 1-5%TASK_TYPE=${task.taskType};CLOUD_TYPE=${cloudTypeFormatted};DEPLOYMENT_ID=${deploymentId};TEST_PLAN_ID=${testPlanId};CP_LABEL=${cpLabel}`;
      if (task.fixture) {
        output += `;DASHBOARD_DATA_GENERATION_FIXTURE=${baseUrl}${task.fixture}/artifact/ui-automation/cypress/dataPreparationDetails.json`;
      }
      output += `;TEST_PLAN_SUMMARY_LABEL=${task.summaryLabel}\n\n`;
    });

    document.getElementById("output").textContent = output;
  });

document.getElementById("taskForm").addEventListener("reset", function () {
  document.getElementById("output").textContent = "";
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