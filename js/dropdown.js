let Btarrow = document.getElementById("Arrows");
let image = document.getElementById("Image");
let Bt2 = document.getElementById("button2");
let Es = document.getElementById("ensemble");
let cpt = 0;
function Arrows() {
    console.log(cpt)
    cpt = cpt + 1;

    if (cpt == 1) {
        Btarrow.querySelector('i').style.transform = "rotate(180deg)";
        Es.style.visibility = "Visible";
        image.style.visibility = " Visible";
        Bt2.style.visibility = "Visible";
    }
    else if (cpt == 2) {
        Btarrow.querySelector('i').style.transform = "rotate(0deg)";
        Bt2.style.visibility = "hidden";
        Es.style.visibility = "hidden";
        image.style.visibility = "hidden";
        cpt = 0
    }
    else {
        console.error("ERREUR");
    }

}
Btarrow.addEventListener("click", Arrows);
