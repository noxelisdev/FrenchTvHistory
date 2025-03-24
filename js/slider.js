const startYear = 1935;
const startMonth = 3; // Avril (index 3 car Janvier = 0)
const endYear = new Date().getFullYear();
const endMonth = new Date().getMonth();

const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

const monthSlider = document.getElementById("month");
const selectedMonthText = document.getElementById("currentMonth");

function getMonthYear(year, month) {
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return `${monthNames[month]} ${year}`;
}

function updateLabel(year, month) {
    selectedMonthText.textContent = getMonthYear(year, month);
}

function updateList(year, month) {
    const selectedMonth = String(year) + "-" + String(month).padStart(2, "0");

    Array.prototype.forEach.call(document.getElementsByClassName("tv"), function(tv) {
        tv.style.display = "none";
    });

    Array.prototype.forEach.call(getDatabase(selectedMonth), function(tvId) {
        console.log(tvId);
        document.getElementById(tvId).style.display = "block";
    });
}

function updateDisplay() {
    const currentValue = parseInt(monthSlider.value);
    let year = startYear + Math.floor((startMonth + currentValue) / 12);
    let month = (startMonth + currentValue) % 12;

    updateLabel(year, month);
    updateList(year, month + 1);
}

monthSlider.max = totalMonths - 1;
monthSlider.addEventListener("input", updateDisplay);

updateDisplay();