export function parseTimeString(timeStr) {
    const [hoursStr, minutes, rest] = timeStr.split(":");
    const [seconds, microseconds] = rest.split(".");
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12;
    if (hours === 0) hours = 12;

    // Pad hours, minutes, seconds
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds.padStart(2,'0')} ${ampm}`;
    return formattedTime;
}