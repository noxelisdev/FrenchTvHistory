const startYear = 1935;
const startMonth = 3; // Avril (index 3 car Janvier = 0)
const endYear = new Date().getFullYear();
const endMonth = new Date().getMonth();

const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

const monthSlider = document.getElementById("month");
const selectedMonthText = document.getElementById("currentMonth");

function getMonthYear(index) {
    let year = startYear + Math.floor((startMonth + index) / 12);
    let month = (startMonth + index) % 12;
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return `${monthNames[month]} ${year}`;
}

function updateLabel() {
    selectedMonthText.textContent = getMonthYear(parseInt(monthSlider.value));
}

monthSlider.max = totalMonths - 1;
monthSlider.addEventListener("input", updateLabel);

updateLabel();