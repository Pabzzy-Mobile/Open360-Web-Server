let sideBarCollapsed = false;

document.querySelector('.sidebar-collapse')
    .addEventListener('mouseup', function (e) {
        sideBarCollapsed = !sideBarCollapsed;
        updateElements();
    });

let updateElements = function () {
    let dependants = document.querySelectorAll('.depends-on-sidebar');
    switch (sideBarCollapsed) {
        case true:
            document.querySelector('.sidebar').classList.add('side-bar-collapsed');
            dependants.forEach((element)=>{
                element.classList.add('side-bar-collapsed');
            });
            break;
        case false:
            document.querySelector('.sidebar').classList.remove('side-bar-collapsed');
            dependants.forEach((element)=>{
                element.classList.remove('side-bar-collapsed');
            });
            break;
    }
}