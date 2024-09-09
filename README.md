# PPS Pipeline Scheduler

This project is a web-based form that allows users to schedule various verification tasks for different cloud types. The form takes input in IST (Indian Standard Time) and converts it to UTC (Coordinated Universal Time) for scheduling purposes.

## Features

- Input fields for CP_LABEL, TEST_PLAN_ID, Cloud Type, and various verification times.
- Default times for different cloud types.
- Conversion of IST to UTC.
- Formatted output for scheduling tasks.
- Copy output to clipboard functionality.

## Usage

1. Open the `PPS Scheduler.html` file in a web browser.
2. Fill in the required fields:
   - CP_LABEL
   - TEST_PLAN_ID
   - Cloud Type
   - DASHBOARD_DATA_GENERATION_FIXTURE Job ID (optional)
   - VMware Verification Time (IST) (optional)
   - Dashboard Verification Time (IST) (optional)
   - Dell Branding Verification Time (IST) (optional)
   - Platform Verification Time (IST) (optional)
   - NAS Verification Time (IST) (optional)
   - Oracle DTC Verification Time (IST) (optional)
   - MSSQL Verification Time (IST) (optional)
3. Click the "Submit" button.
4. The formatted output will be displayed in the "Formatted Output" section.
5. Click the clipboard icon to copy the output to the clipboard.

## Default Times

The form provides default times for different cloud types if no time is specified:

### Mainline dep1

- VMware: 00:00 IST
- Dashboard: 02:00 IST
- Dell Branding: 02:30 IST
- Platform: 03:00 IST
- NAS: 06:00 IST
- Oracle DTC: 07:30 IST
- MSSQL: 09:15 IST

### Mainline dep0

- Dell Branding: 15:00 IST
- Platform: 15:15 IST
- Dashboard: 15:45 IST
- VMware: 16:00 IST
- NAS: 17:00 IST
- Oracle DTC: 18:00 IST
- MSSQL: 19:00 IST

### Gov

- Dell Branding: 19:30 IST
- Platform: 19:15 IST
- Dashboard: 19:45 IST
- VMware: 20:00 IST
- NAS: 21:00 IST
- Oracle DTC: 22:00 IST
- MSSQL: 23:00 IST

## Code Explanation

### HTML Structure

- The form contains input fields for various parameters.
- The output section displays the formatted scheduling tasks.
- A clipboard icon allows users to copy the output.

### JavaScript Functions

- `convertISTtoUTC(time)`: Converts IST to UTC.
- `document.getElementById('taskForm').addEventListener('submit', function (event) {...})`: Handles form submission, calculates default times, converts times to UTC, and generates the formatted output.
- `copyOutput()`: Copies the formatted output to the clipboard.

## Example Output

*(Include example output here, if available)*

## License

This project is licensed under the MIT License.

Feel free to modify the `PPS Scheduler.html` file to suit your needs. If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request.
