fetch("https://api.github.com/repos/noxelisdev/FrenchTvHistory/branches/master").then((response) => response.json()).then((data) => {
    const commitDate = new Date(data.commit.commit.author.date);
    document.getElementById("latestupdate").innerHTML = commitDate.toLocaleDateString("fr-FR") + " à " + commitDate.toLocaleTimeString("fr-FR").substring(0,5).replace(":", "h");
    document.getElementsByClassName("footer")[0].style.display = "block";
})