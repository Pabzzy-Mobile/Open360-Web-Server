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
            document.querySelector('.sidebar').classList.add('sidebar-collapsed');
            dependants.forEach((element)=>{
                element.classList.add('sidebar-collapsed');
            });
            break;
        case false:
            document.querySelector('.sidebar').classList.remove('sidebar-collapsed');
            dependants.forEach((element)=>{
                element.classList.remove('sidebar-collapsed');
            });
            break;
    }
}