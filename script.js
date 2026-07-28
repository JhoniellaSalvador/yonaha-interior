/* ==========================================================
   YONAHA INTERIOR
   Flooring Schedule Manager
   SECTION 03
   LOGIN JAVASCRIPT
==========================================================*/

/* ==========================================================
   SHOW / HIDE PASSWORD
==========================================================*/

function setupPasswordToggle(toggleId, inputId){

    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if(!toggle || !input) return;

    toggle.addEventListener("click", () => {

        const icon = toggle.querySelector("i");

        if(input.type === "password"){

            input.type = "text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

        }else{

            input.type = "password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

        }

    });

}

setupPasswordToggle(
    "togglePassword",
    "password"
);

setupPasswordToggle(
    "toggleRegisterPassword",
    "registerPassword"
);

setupPasswordToggle(
    "toggleRegisterConfirmPassword",
    "registerConfirmPassword"
);

/* ==========================================================
   LOGIN FORM
==========================================================*/

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username");

        const password =
            document.getElementById("password");

        const usernameError =
            document.getElementById("usernameError");

        const passwordError =
            document.getElementById("passwordError");

        const loginBtn =
            document.getElementById("loginBtn");


        // RESET

        username.classList.remove("error");
        password.classList.remove("error");

        usernameError.classList.remove("show");
        passwordError.classList.remove("show");

        usernameError.textContent = "";
        passwordError.textContent = "";


        let isValid = true;


        // EMPTY USERNAME

        if (username.value.trim() === "") {

            username.classList.add("error");

            usernameError.textContent =
                "Please enter your username.";

            usernameError.classList.add("show");

            isValid = false;

        }


        // EMPTY PASSWORD

        if (password.value.trim() === "") {

            password.classList.add("error");

            passwordError.textContent =
                "Please enter your password.";

            passwordError.classList.add("show");

            isValid = false;

        }


        if (!isValid) return;



        /* ==========================
           FIND USER EMAIL
        ========================== */


        const inputUsername =
            username.value.trim();


        const { data: profile, error: profileError } =
            await window.db
                .from("profiles")
                .select("email")
                .eq("username", inputUsername)
                .single();



        console.log("Profile:", profile);
        console.log("Profile Error:", profileError);



        if (profileError || !profile) {

            username.classList.add("error");

            usernameError.textContent =
                "User not found.";

            usernameError.classList.add("show");

            return;

        }



        /* ==========================
           SUPABASE LOGIN
        ========================== */


        const { data, error } =
            await window.db.auth.signInWithPassword({

                email: profile.email,

                password: password.value

            });



        if (error) {

            password.classList.add("error");

            passwordError.textContent =
                "Incorrect password.";

            passwordError.classList.add("show");

            return;

        }



        const account = data.user;



        /* ==========================
           REMEMBER ME
        ========================== */


        const rememberMe =
            document.getElementById("rememberMe");


        if (rememberMe.checked) {

            localStorage.setItem(
                "rememberUsername",
                inputUsername
            );

        } else {

            localStorage.removeItem(
                "rememberUsername"
            );

        }



        /* ==========================
           LOGIN SUCCESS
        ========================== */


        loginBtn.disabled = true;

        loginBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';



        setTimeout(async () => {


            localStorage.setItem(
                "currentUser",
                account.id
            );


            console.log(
                "currentUser:",
                localStorage.getItem("currentUser")
            );



            salaryRecords = [];

            await loadSalaryYears();

            await renderSalaryReports();



            document.getElementById("loginPage").style.display =
                "none";


            document.getElementById("mainApp").style.display =
                "flex";



            loadCurrentUserProfile();

            await updateGreeting();



            renderHistoryTable();

            renderRecentSchedule();

            updateTodaySchedule();

            updateDashboardSummary();

            updateMonthlyOverview();



            showPage("dashboard");



            // RESET FORM

            password.value = "";


            if (!rememberMe.checked) {

                username.value = "";

            }


            loginBtn.disabled = false;

            loginBtn.innerHTML =
                "Login";


        }, 1000);


    });

}

/* ==========================================================
   MONTHLY OVERVIEW CHART
==========================================================*/

let monthlyChart = null;

async function updateMonthlyOverview(){

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        console.log("No current user. Skip monthly overview.");
        return;
    }

    const { data: schedules, error } = await window.db
        .from("schedules")
        .select("*")
        .eq("user_id", currentUser);

if (error) {

    console.error(error);

    return;

}

schedules.forEach(schedule => {

    schedule.type = schedule.schedule_type;

});

    let work = 0;
    let yasumi = 0;
    let holiday = 0;

    schedules.forEach(schedule => {

        if (!schedule.type) return;

        switch (schedule.type.toLowerCase()) {

            case "work":
                work++;
                break;

            case "yasumi":
                yasumi++;
                break;

            case "holiday":
                holiday++;
                break;

        }

    });

    // Update Legend

    const workLegend = document.getElementById("legendWork");
    const yasumiLegend = document.getElementById("legendYasumi");
    const holidayLegend = document.getElementById("legendHoliday");

    if(workLegend) workLegend.textContent = work;
    if(yasumiLegend) yasumiLegend.textContent = yasumi;
    if(holidayLegend) holidayLegend.textContent = holiday;

    const canvas = document.getElementById("monthlyChart");

    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    if(monthlyChart){

        monthlyChart.destroy();

    }

    monthlyChart = new Chart(ctx,{

        type:"bar",

        data:{

            labels:[

                "Week 1",
                "Week 2",
                "Week 3",
                "Week 4"

            ],

            datasets:[

                {

                    label:"Work",

                    data:[work,work,work,work],

                    backgroundColor:"#27AE60",

                    borderRadius:6

                },

                {

                    label:"Yasumi",

                    data:[yasumi,yasumi,yasumi,yasumi],

                    backgroundColor:"#F4C542",

                    borderRadius:6

                },

                {

                    label:"Holiday",

                    data:[holiday,holiday,holiday,holiday],

                    backgroundColor:"#E74C3C",

                    borderRadius:6

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    display:false
                }

            },

            scales:{

                x:{

                    grid:{
                        display:false
                    },

                    ticks:{
                        color:"#FFFFFF"
                    }

                },

                y:{

                    beginAtZero:true,

                    ticks:{
                        color:"#FFFFFF",
                        stepSize:1
                    },

                    grid:{
                        color:"rgba(255,255,255,.08)"
                    }

                }

            }

        }

    });

}

/* ==========================================================
   PAGE NAVIGATION
==========================================================*/

const pages = {
    dashboard: document.getElementById("dashboardPage"),
    schedule: document.getElementById("schedulePage"),
    history: document.getElementById("historyPage"),
    salary: document.getElementById("salaryPage"),
    reports: document.getElementById("reportsPage"),
    profile: document.getElementById("profilePage"),
    settings: document.getElementById("settingsPage")
};

const navs = {
    dashboard: document.getElementById("dashboardNav"),
    schedule: document.getElementById("scheduleNav"),
    history: document.getElementById("historyNav"),
    salary: document.getElementById("salaryNav"),
    reports: document.getElementById("reportsNav"),
    profile: document.getElementById("profileNav"),
    settings: document.getElementById("settingsNav"),
    logout: document.getElementById("logoutNav")
};

function showPage(pageName){

    Object.values(pages).forEach(page => {

        if(page) page.style.display = "none";

    });

    Object.values(navs).forEach(nav => {

        if(nav) nav.classList.remove("active");

    });

    if(pages[pageName]){

    pages[pageName].style.display = "block";

    if(pageName === "dashboard"){
        updateMonthlyOverview();
    }

}

    if(navs[pageName]){

        navs[pageName].classList.add("active");

    }

    const activeUser = localStorage.getItem("currentUser");

if(activeUser){

    localStorage.setItem(
        "activePage_" + activeUser,
        pageName
    );

}

}

Object.keys(navs).forEach(page => {

    if(!navs[page]) return;

    if(page==="logout") return;

    navs[page].addEventListener("click",()=>{

        showPage(page);

    });

});

/* ==========================================================
   SECTION 13
   LIVE DATE & TIME
==========================================================*/

function updateDateTime(){

    const now = new Date();

    const options = {

        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"

    };

    document.getElementById("currentDate").textContent =
        now.toLocaleDateString("en-US", options);

    document.getElementById("liveTime").textContent =
        now.toLocaleTimeString("en-US");

}

updateDateTime();

setInterval(updateDateTime, 1000);


/* ==========================================================
   EDIT MODE
==========================================================*/

let editingScheduleId = null;

/* ==========================================================
   SECTION 09
   SAVE SCHEDULE
==========================================================*/

const scheduleForm = document.getElementById("scheduleForm");

if (scheduleForm) {

    scheduleForm.addEventListener("submit", function (e) {

        e.preventDefault();

        saveSchedule();

    });

}

async function saveSchedule() {

    const schedule = {

        id: Date.now(),

        date: document.getElementById("scheduleDate").value,

        location: document.getElementById("location").value,

        building: document.getElementById("building").value,

        engineer: document.getElementById("scheduleEngineer").value,

        geneCon: document.getElementById("scheduleGeneCon").value,

        flooringType: document.getElementById("scheduleFlooringType").value,

        type: document.getElementById("scheduleType").value,

        timeIn: document.getElementById("timeIn").value,

        timeOut: document.getElementById("timeOut").value,

        notes: document.getElementById("scheduleNotes").value,

    };

    /* VALIDATION */

if(!schedule.date){

    alert("Please select a date.");

    return;

}

if(!schedule.type){

    alert("Please select a schedule type.");

    return;

}

/* REQUIRED ONLY FOR WORK */

if(schedule.type === "Work"){

    if(

        !schedule.location ||

        !schedule.building ||

        !schedule.engineer ||

        !schedule.geneCon ||

        !schedule.flooringType ||

        !schedule.timeIn ||

        !schedule.timeOut

    ){

        alert("Please complete all work details.");

        return;

    }

}

    /* LOAD OLD DATA */

    const currentUser = localStorage.getItem("currentUser");

   /* SAVE OR UPDATE */

const isEditing = editingScheduleId !== null;

if (isEditing) {

    const { error } = await window.db
        .from("schedules")
        .update({
            date: schedule.date,
            location: schedule.location,
            building: schedule.building,
            engineer: schedule.engineer,
            gene_con: schedule.geneCon,
            flooring_type: schedule.flooringType,
            schedule_type: schedule.type,
            time_in: schedule.timeIn,
            time_out: schedule.timeOut,
            notes: schedule.notes
        })
        .eq("id", editingScheduleId);

    if (error) {

        alert(error.message);

        return;

    }

    editingScheduleId = null;

} else {

    const { error } = await window.db
        .from("schedules")
        .insert({
            user_id: currentUser,
            date: schedule.date,
            location: schedule.location,
            building: schedule.building,
            engineer: schedule.engineer,
            gene_con: schedule.geneCon,
            flooring_type: schedule.flooringType,
            schedule_type: schedule.type,
            time_in: schedule.timeIn,
            time_out: schedule.timeOut,
            notes: schedule.notes
        });

    if (error) {

        alert(error.message);

        return;

    }

}

    alert(isEditing ? "Schedule updated successfully!" : "Schedule saved successfully!");

renderHistoryTable();

updateTodaySchedule();

renderRecentSchedule();

updateDashboardSummary();

updateMonthlyOverview();

resetScheduleForm();

if(isEditing){

    showPage("history");

}

}

const resetScheduleBtn = document.getElementById("resetScheduleBtn");

if (resetScheduleBtn) {

    resetScheduleBtn.addEventListener("click", () => {

        resetScheduleForm();

    });

}

/* ==========================================================
   SECTION 10
   RENDER HISTORY TABLE
==========================================================*/

async function renderHistoryTable(){

    const historyTableBody = document.getElementById("historyTableBody");

    if (!historyTableBody) return;

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        console.log("No current user. Skip history table.");
        return;
    }

    const { data: schedules, error } = await window.db
        .from("schedules")
        .select("*")
        .eq("user_id", currentUser)
        .order("date", { ascending: true });

if (error) {

    console.error(error);

    return;

}

schedules.forEach(schedule => {

    schedule.geneCon = schedule.gene_con;

    schedule.flooringType = schedule.flooring_type;

    schedule.type = schedule.schedule_type;

    schedule.timeIn = schedule.time_in;

    schedule.timeOut = schedule.time_out;

});

    const search = document
    .getElementById("historySearch")
    .value
    .toLowerCase();

    const selectedMonth = document.getElementById("historyMonth").value;
    const selectedYear = document.getElementById("historyYear").value;
    const selectedStatus = document.getElementById("historyStatus").value;

    historyTableBody.innerHTML = "";

    const filteredSchedules = schedules.filter(schedule => {

    const scheduleMonth = String(
        new Date(schedule.date).getMonth() + 1
    );

    const scheduleYear = String(
        new Date(schedule.date).getFullYear()
    );

    const matchSearch =

    (schedule.date || "").toLowerCase().includes(search) ||

    (schedule.location || "").toLowerCase().includes(search) ||

    (schedule.building || "").toLowerCase().includes(search) ||

    (schedule.engineer || "").toLowerCase().includes(search) ||

    (schedule.geneCon || "").toLowerCase().includes(search) ||

    (schedule.flooringType || "").toLowerCase().includes(search);

    const matchMonth =

        selectedMonth === "all" ||

        scheduleMonth === selectedMonth;

    const matchYear =

        selectedYear === "all" ||

        scheduleYear === selectedYear;

    const matchStatus =

    selectedStatus === "all" ||

    schedule.type.toLowerCase() === selectedStatus;

    return matchSearch && matchMonth && matchYear && matchStatus;

});


   const displaySchedules = search
    ? filteredSchedules
    : filteredSchedules.slice(-13).reverse();

displaySchedules.forEach(schedule=>{

        historyTableBody.innerHTML += `

        <tr>

            <td>${schedule.date}</td>

           <td title="${schedule.location || ""}">
    ${schedule.location || "—"}
</td>

            <td title="${schedule.building || ""}">
    ${schedule.building || "—"}
</td>

            <td title="${schedule.engineer || ""}">
    ${schedule.engineer || "—"}
</td>

            <td title="${schedule.geneCon || ""}">
    ${schedule.geneCon || "—"}
</td>

            <td title="${schedule.flooringType || ""}">
    ${schedule.flooringType || "—"}
</td>

            <td>${schedule.type || "—"}</td>

            <td>${schedule.timeIn || "—"}</td>

            <td>${schedule.timeOut || "—"}</td>

            <td>

    ${
        schedule.notes
        ?
        `
        <span
    class="view-note-btn"
    data-id="${schedule.id}">

    View

</span>
        `
        :
        "—"
    }

</td>

            <td>

<div class="history-actions">

<span
class="edit-btn"
data-id="${schedule.id}">

 Edit

</span>

<span
class="delete-btn"
data-id="${schedule.id}">

 Delete

</span>

</div>

</td>

        </tr>

        `;

    });

}

/* ==========================================================
   HISTORY TABLE EVENTS
==========================================================*/

const historyTableBody = document.getElementById("historyTableBody");

if (historyTableBody) {

    historyTableBody.addEventListener("click", async function(event){


        /* ==========================
           EDIT
        ========================== */

        if(event.target.classList.contains("edit-btn")){

            editSchedule(event);

        }

/* ==========================
   VIEW NOTES
========================== */

if(event.target.classList.contains("view-note-btn")){

    const id = event.target.dataset.id;

    console.log("VIEW NOTES ID:", id);


    if(!id){

        console.error("No schedule ID found.");

        return;

    }


    const { data: schedule, error } = await window.db
        .from("schedules")
        .select("notes")
        .eq("id", id)
        .maybeSingle();


    if(error){

        console.error("View Notes Supabase Error:", error);

        alert("Unable to load notes.");

        return;

    }


    if(!schedule){

        notesContent.textContent = "No notes available.";

        notesModal.style.display = "flex";

        return;

    }


    notesContent.textContent =
        schedule.notes || "No notes available.";


    notesModal.style.display = "flex";

}

        /* ==========================
           DELETE
        ========================== */

        if(event.target.classList.contains("delete-btn")){

            const id = Number(event.target.dataset.id);

            const confirmDelete = confirm(
                "Are you sure you want to delete this schedule?"
            );

            if(!confirmDelete) return;

           const { error } = await window.db
    .from("schedules")
    .delete()
    .eq("id", id);

if (error) {

    alert(error.message);

    return;

}

await renderHistoryTable();
await updateTodaySchedule();
await renderRecentSchedule();
await updateDashboardSummary();
await updateMonthlyOverview();

        }

    });

}

/* ==========================================================
   SECTION 11
   UPDATE TODAY SCHEDULE
==========================================================*/

async function updateTodaySchedule(){

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        console.log("No current user. Skip today schedule.");
        return;
    }

    const { data: schedules, error } = await window.db
        .from("schedules")
        .select("*")
        .eq("user_id", currentUser)
        .order("date", { ascending: true });

if (error) {

    console.error(error);

    return;

}

schedules.forEach(schedule => {

    schedule.geneCon = schedule.gene_con;

    schedule.flooringType = schedule.flooring_type;

    schedule.type = schedule.schedule_type;

    schedule.timeIn = schedule.time_in;

    schedule.timeOut = schedule.time_out;

});

   const now = new Date();

   const today = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

    const todaySchedule = schedules.find(schedule => schedule.date === today);

    if(!todaySchedule){

    document.getElementById("todayDate").textContent = "--";
    document.getElementById("todayLocation").textContent = "--";
    document.getElementById("todayBuilding").textContent = "--";
    document.getElementById("todayEngineer").textContent = "--";
    document.getElementById("todayGeneCon").textContent = "--";
    document.getElementById("todayFlooringType").textContent = "--";
    document.getElementById("todayTimeIn").textContent = "--";
    document.getElementById("todayTimeOut").textContent = "--";

    document.getElementById("todayStatus").innerHTML = "NO<br>SCHEDULE";
    document.getElementById("todayWorkStatus").textContent = "--";
    document.getElementById("todayEmoji").textContent = "📅";

    const todayBadge = document.querySelector(".today-badge");

    todayBadge.textContent = "NO SCHEDULE";

    todayBadge.classList.remove(
        "badge-work",
        "badge-yasumi",
        "badge-holiday"
    );

    todayBadge.style.background = "#3A3A3A";
    todayBadge.style.color = "#D0D0D0";

    return;

}

    document.getElementById("todayDate").textContent = todaySchedule.date;
    document.getElementById("todayLocation").textContent = todaySchedule.location;
    document.getElementById("todayBuilding").textContent = todaySchedule.building;
    document.getElementById("todayEngineer").textContent = todaySchedule.engineer;
    document.getElementById("todayGeneCon").textContent = todaySchedule.geneCon || "--";
    document.getElementById("todayFlooringType").textContent = todaySchedule.flooringType || "--";
    document.getElementById("todayTimeIn").textContent =
    todaySchedule.timeIn || "--";

    document.getElementById("todayTimeOut").textContent =
    todaySchedule.timeOut || "--";
    document.getElementById("todayStatus").textContent = todaySchedule.type.toUpperCase();
    document.getElementById("todayWorkStatus").textContent = todaySchedule.type;

    /* CHANGE HEADER BADGE */

const todayBadge = document.querySelector(".today-badge");
todayBadge.style.background = "";
todayBadge.style.color = "";

todayBadge.textContent = todaySchedule.type.toUpperCase();

todayBadge.classList.remove(
    "badge-work",
    "badge-yasumi",
    "badge-holiday"
);

const todayEmoji = document.getElementById("todayEmoji");

switch(todaySchedule.type){

    case "Work":

        todayEmoji.textContent = "💼";
        todayBadge.classList.add("badge-work");
        break;

    case "Yasumi":

        todayEmoji.textContent = "😴";
        todayBadge.classList.add("badge-yasumi");
        break;

    case "Holiday":

        todayEmoji.textContent = "🎉";
        todayBadge.classList.add("badge-holiday");
        break;

}

}

/* ==========================================================
   SECTION 12
   UPDATE DASHBOARD SUMMARY
==========================================================*/

async function updateDashboardSummary(){

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        console.log("No current user. Skip dashboard summary.");
        return;
    }

    const { data: schedules, error } = await window.db
        .from("schedules")
        .select("schedule_type")
        .eq("user_id", currentUser);

    if (error) {

        console.error(error);

        return;

    }

    document.getElementById("totalSchedule").textContent = schedules.length;

    const work = schedules.filter(
        schedule => schedule.schedule_type === "Work"
    ).length;

    const yasumi = schedules.filter(
        schedule => schedule.schedule_type === "Yasumi"
    ).length;

    const holiday = schedules.filter(
        schedule => schedule.schedule_type === "Holiday"
    ).length;

    document.getElementById("workCount").textContent = work;

    document.getElementById("yasumiCount").textContent = yasumi;

    document.getElementById("holidayCount").textContent = holiday;

}

/* ==========================================================
   SECTION 13
   EDIT SCHEDULE
==========================================================*/

async function editSchedule(event){

    const id = Number(event.target.dataset.id);

    const { data: schedule, error } = await window.db
    .from("schedules")
    .select("*")
    .eq("id", id)
    .single();

if (error || !schedule) {

    console.error(error);

    return;

}

schedule.geneCon = schedule.gene_con;
schedule.flooringType = schedule.flooring_type;
schedule.type = schedule.schedule_type;
schedule.timeIn = schedule.time_in;
schedule.timeOut = schedule.time_out;

    editingScheduleId = id;

    document.getElementById("scheduleDate").value = schedule.date;
    document.getElementById("location").value = schedule.location;
    document.getElementById("building").value = schedule.building;
    document.getElementById("scheduleEngineer").value = schedule.engineer;
    document.getElementById("scheduleGeneCon").value = schedule.geneCon || "";
    document.getElementById("scheduleFlooringType").value = schedule.flooringType || "";
    document.getElementById("scheduleType").value = schedule.type;
    document.getElementById("timeIn").value = schedule.timeIn;
    document.getElementById("timeOut").value = schedule.timeOut;
    document.getElementById("scheduleNotes").value = schedule.notes || "";

    updateScheduleFields();

showPage("schedule");

}

/* ==========================================================
   SECTION 16
   NOTES MODAL VARIABLES
==========================================================*/

const notesModal = document.getElementById("notesModal");

const notesContent = document.getElementById("notesContent");

const closeNotesBtn = document.getElementById("closeNotesBtn");

if (closeNotesBtn) {

    closeNotesBtn.addEventListener("click", () => {

        notesModal.style.display = "none";

    });

}

/* ==========================================================
   SECTION 10
   RESET SCHEDULE FORM
==========================================================*/

function resetScheduleForm() {

    document.getElementById("scheduleDate").value = "";

    document.getElementById("location").value = "";

    document.getElementById("building").value = "";

    document.getElementById("scheduleEngineer").value = "";

    document.getElementById("scheduleGeneCon").value = "";

    document.getElementById("scheduleFlooringType").value = "";

    document.getElementById("scheduleType").selectedIndex = 0;

    document.getElementById("timeIn").value = "";

    document.getElementById("timeOut").value = "";

    document.getElementById("scheduleNotes").value = "";

    editingScheduleId = null;

    updateScheduleFields();

}

/* ==========================================================
   SECTION 14
   SCHEDULE TYPE BEHAVIOR
==========================================================*/

const scheduleType = document.getElementById("scheduleType");

scheduleType.addEventListener("change", updateScheduleFields);

function updateScheduleFields(){

    const isWork = scheduleType.value === "Work";

    document.getElementById("location").disabled = !isWork;
    document.getElementById("building").disabled = !isWork;
    document.getElementById("scheduleEngineer").disabled = !isWork;
    document.getElementById("scheduleGeneCon").disabled = !isWork;
    document.getElementById("scheduleFlooringType").disabled = !isWork;
    document.getElementById("timeIn").disabled = !isWork;
    document.getElementById("timeOut").disabled = !isWork;

    /* CLEAR WORK FIELDS */

    if(!isWork){

        document.getElementById("location").value = "";

        document.getElementById("building").value = "";

        document.getElementById("scheduleEngineer").value = "";

        document.getElementById("scheduleGeneCon").value = "";

        document.getElementById("scheduleFlooringType").value = "";

        document.getElementById("timeIn").value = "";

        document.getElementById("timeOut").value = "";

    }

}

/* INITIALIZE */

updateScheduleFields();

// Huwag mag-reset kapag hindi pa naka-login
if (localStorage.getItem("currentUser")) {
    resetScheduleForm();
}

/* ==========================================================
   HISTORY SEARCH
==========================================================*/

document
.getElementById("historySearch")
.addEventListener("input", renderHistoryTable);

document
.getElementById("historyMonth")
.addEventListener("change", function(){

    renderHistoryTable();

    filterMenu.style.display = "none";

});


document
.getElementById("historyYear")
.addEventListener("change", function(){

    renderHistoryTable();

    filterMenu.style.display = "none";

});


document
.getElementById("historyStatus")
.addEventListener("change", function(){

    renderHistoryTable();

    filterMenu.style.display = "none";

});

/* ==========================================================
   FILTER DROPDOWN
==========================================================*/

const filterBtn = document.getElementById("filterBtn");
const filterMenu = document.getElementById("filterMenu");

if (filterBtn && filterMenu) {

    filterBtn.addEventListener("click", function(e){

        e.stopPropagation();

        if(filterMenu.style.display === "block"){

            filterMenu.style.display = "none";

        } else {

            filterMenu.style.display = "block";

        }

    });

    document.addEventListener("click", function(e){

        if(

            !filterMenu.contains(e.target) &&

            !filterBtn.contains(e.target)

        ){

            filterMenu.style.display = "none";

        }

    });

}

/* ==========================================================
   SECTION 12
   RENDER RECENT SCHEDULE
==========================================================*/

async function renderRecentSchedule(){

    const recentList = document.getElementById("recentScheduleList");

    if (!recentList) return;

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        console.log("No current user. Skip recent schedule.");
        return;
    }

    const { data: schedules, error } = await window.db
        .from("schedules")
        .select("*")
        .eq("user_id", currentUser)
        .order("date", { ascending: false });

if (error) {

    console.error(error);

    return;

}

schedules.forEach(schedule => {

    schedule.geneCon = schedule.gene_con;

    schedule.flooringType = schedule.flooring_type;

    schedule.type = schedule.schedule_type;

    schedule.timeIn = schedule.time_in;

    schedule.timeOut = schedule.time_out;

});

    recentList.innerHTML = "";

    if(schedules.length === 0){

        recentList.innerHTML = `
            <div class="recent-card">
                <div class="recent-date">
                    No Schedule Found
                </div>
            </div>
        `;

        return;

    }

    schedules
    .slice(0,5)
    .forEach(schedule=>{

        const date = new Date(schedule.date);

        const day = String(date.getDate()).padStart(2,"0");

        const month = date.toLocaleString("en-US",{month:"short"}).toUpperCase();

        const year = date.getFullYear();

        let title = "";
        let line1 = "";
        let line2 = "";

        if(schedule.type === "Work"){

            title = schedule.location || "--";

            line1 = `${schedule.building || "--"} • ${schedule.engineer || "--"}`;

            line2 = `${schedule.flooringType || "--"} • ${schedule.timeIn || "--"} - ${schedule.timeOut || "--"}`;
        }

        else if(schedule.type === "Yasumi"){

            title = "DAY OFF";

            line1 = "No work schedule";

            line2 = "Enjoy your rest day";

        }

        else{

            title = "HOLIDAY";

            line1 = "No work schedule";

            line2 = "Official Holiday";

        }

        recentList.innerHTML += `

        <div class="recent-card">

            <div class="recent-date-box">

                <span class="recent-month">${month}</span>

                <span class="recent-day">${day}</span>

                <span class="recent-year">${year}</span>

            </div>

            <div class="recent-details">

                <div class="recent-location">

                    ${title}

                </div>

                <div class="recent-building">

                    ${line1}

                </div>

                <div class="recent-tile">

                    ${line2}

                </div>

            </div>

            <span class="recent-status ${schedule.type.toLowerCase()}">

                ${schedule.type.toUpperCase()}

            </span>

        </div>

        `;

    });

}

const viewHistoryBtn = document.getElementById("viewHistoryBtn");

if (viewHistoryBtn) {

    viewHistoryBtn.addEventListener("click", () => {

        renderHistoryTable();

        showPage("history");

    });

}

/* ==========================================================
   SALARY MODULE
========================================================== */

let salaryRecords = [];

const salaryMonthFilter = document.getElementById("salaryMonthFilter");
const salaryYearFilter = document.getElementById("salaryYearFilter");

/* ==========================================================
   SALARY FILTER BUTTON
========================================================== */

const salaryFilterBtn = document.getElementById("salaryFilterBtn");
const salaryFilterMenu = document.getElementById("salaryFilterMenu");


if (salaryFilterBtn && salaryFilterMenu) {

    salaryFilterBtn.onclick = function(){

        salaryFilterMenu.classList.toggle("show");

    };

}

salaryMonthFilter.addEventListener("change", function(){

    renderSalaryReports();

    salaryFilterMenu.classList.remove("show");

});


salaryYearFilter.addEventListener("change", function(){

    renderSalaryReports();

    salaryFilterMenu.classList.remove("show");

});

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


months.forEach((month, index) => {

    salaryMonthFilter.innerHTML += `
        <option value="${index + 1}">
            ${month}
        </option>
    `;

});

/* ==========================================================
   LOAD SALARY YEARS
========================================================== */

function loadSalaryYears(){

    salaryYearFilter.innerHTML = `
        <option value="">All Years</option>
    `;


    const years = [];


    salaryRecords.forEach(record => {

        const year = new Date(record.datePaid)
            .getFullYear();


        if(!years.includes(year)){

            years.push(year);

        }

    });


    years.forEach(year => {

        salaryYearFilter.innerHTML += `

            <option value="${year}">
                ${year}
            </option>

        `;

    });

}


loadSalaryYears();

let editingSalaryIndex = -1;

const saveSalaryBtn = document.getElementById("saveSalaryBtn");

const salaryEngineer = document.getElementById("salaryEngineer");
const salaryLocation = document.getElementById("salaryLocation");
const salaryBuilding = document.getElementById("salaryBuilding");

const workFrom = document.getElementById("workFrom");
const workTo = document.getElementById("workTo");

const salaryArea = document.getElementById("salaryArea");
const salaryAmount = document.getElementById("salaryAmount");

const salaryDate = document.getElementById("salaryDate");
const salaryStatus = document.getElementById("salaryStatus");

saveSalaryBtn.addEventListener("click", async function () {

    const currentUser = localStorage.getItem("currentUser");

    if (
    salaryEngineer.value.trim() === "" ||
    salaryLocation.value.trim() === "" ||
    salaryBuilding.value.trim() === "" ||
    workFrom.value === "" ||
    workTo.value === "" ||
    salaryArea.value.trim() === "" ||
    salaryAmount.value === "" ||
    salaryDate.value === ""
) {

        alert("Please complete all fields.");

        return;

    }

    const salaryData = {

    engineer: salaryEngineer.value.trim(),

    location: salaryLocation.value.trim(),

    building: salaryBuilding.value.trim(),

    workFrom: workFrom.value,

    workTo: workTo.value,

    area: salaryArea.value.trim(),

    amount: Number(salaryAmount.value),

    datePaid: salaryDate.value,

    status: salaryStatus.value

};

    if (editingSalaryIndex === -1) {

    const { error } = await window.db
        .from("salary_records")
        .insert({

            user_id: currentUser,

            engineer: salaryData.engineer,

            location: salaryData.location,

            building: salaryData.building,

            work_from: salaryData.workFrom,

            work_to: salaryData.workTo,

            area: salaryData.area,

            amount: salaryData.amount,

            date_paid: salaryData.datePaid,

            status: salaryData.status

        });

    if (error) {

        alert(error.message);

        return;

    }

} else {

    const { error } = await window.db
        .from("salary_records")
        .update({

            engineer: salaryData.engineer,

            location: salaryData.location,

            building: salaryData.building,

            work_from: salaryData.workFrom,

            work_to: salaryData.workTo,

            area: salaryData.area,

            amount: salaryData.amount,

            date_paid: salaryData.datePaid,

            status: salaryData.status

        })
        .eq("id", editingSalaryIndex);

    if (error) {

        alert(error.message);

        return;

    }

    editingSalaryIndex = -1;

    saveSalaryBtn.textContent = "Save Payment";

}

renderSalaryReports();

loadSalaryYears();

alert("Payment saved successfully.");

resetSalaryForm();

showPage("reports");

});

/* ==========================================================
   RESET SALARY FORM
==========================================================*/

function resetSalaryForm(){

    salaryEngineer.value = "";

    salaryLocation.value = "";

    salaryBuilding.value = "";

    workFrom.value = "";

    workTo.value = "";

    salaryArea.value = "";

    salaryAmount.value = "";

    salaryDate.value = "";

    salaryStatus.selectedIndex = 0;

}

/* ==========================================================
   RENDER PROJECT REPORTS
========================================================== */

async function renderSalaryReports(){

    const currentUser = localStorage.getItem("currentUser");

if (!currentUser || currentUser === "null" || currentUser === "undefined") {

    console.log("Invalid currentUser. Skip salary reports:", currentUser);

    return;

}

    const { data: salaryRecordsData, error } = await window.db
        .from("salary_records")
        .select("*")
        .eq("user_id", currentUser)
        .order("date_paid", { ascending: false });

    if (error) {

    console.log("Salary Error:", error);
    console.log("Current User:", currentUser);

    return;

}

salaryRecords = salaryRecordsData.map(record => ({

    ...record,

    workFrom: record.work_from,

    workTo: record.work_to,

    datePaid: record.date_paid

}));

loadSalaryYears();

    const container = document.getElementById("salaryReportTable");

    container.innerHTML = "";

    const search = document
        .getElementById("salarySearch")
        .value
        .toLowerCase();

    const selectedMonth =
        document.getElementById("salaryMonthFilter").value;

    const selectedYear =
        document.getElementById("salaryYearFilter").value;

    const filteredSalary = salaryRecords.filter(record => {

        const recordDate = new Date(record.datePaid);

        const month = String(recordDate.getMonth() + 1);

        const year = String(recordDate.getFullYear());

        const matchSearch =

            (record.location || "").toLowerCase().includes(search) ||

            (record.building || "").toLowerCase().includes(search) ||

            (record.engineer || "").toLowerCase().includes(search);

        const matchMonth =

            selectedMonth === "" ||

            month === selectedMonth;

        const matchYear =

            selectedYear === "" ||

            year === selectedYear;

        return matchSearch && matchMonth && matchYear;

    });

// Show only 5 records when there is no search
const displaySalary = search.trim()
    ? filteredSalary
    : filteredSalary.slice(0, 5);

    if(filteredSalary.length === 0){

        container.innerHTML = `
            <div class="project-empty">
                No salary records found.
            </div>
        `;

        document.getElementById("reportTotalSalary").textContent = "¥0";
        document.getElementById("reportTotalProjects").textContent = "0";
        document.getElementById("reportTotalArea").textContent = "0㎡";
        document.getElementById("reportTotalWorkdays").textContent = "0";

        return;

    }

    function getWorkDays(from, to){

        if(!from || !to) return 0;

        const start = new Date(from);

        const end = new Date(to);

        const diff = Math.floor(

            (end - start) / (1000 * 60 * 60 * 24)

        ) + 1;

        return diff > 0 ? diff : 1;

    }

    function formatShortDate(date){

        if(!date) return "-";

        const d = new Date(date);

        return d.toLocaleDateString("en-US",{

            month:"short",

            day:"2-digit"

        });

    }

    displaySalary.forEach((record)=>{

    const index = salaryRecords.indexOf(record);
        container.innerHTML += `

<div class="project-card">

    <div class="project-icon">

        <i class="fas fa-building"></i>

    </div>

    <div class="project-location-wrap">

        <div class="project-location">

            <i class="fas fa-map-marker-alt"></i>

            ${record.location || "-"}

        </div>

        <div class="project-workdays">

            ${getWorkDays(record.workFrom, record.workTo)}
            ${getWorkDays(record.workFrom, record.workTo) === 1 ? "Work Day" : "Work Days"}

        </div>

    </div>

    <div class="project-cell">

        <span>Building</span>

        <strong>${record.building}</strong>

    </div>

    <div class="project-cell">

        <span>Engineer</span>

        <strong>${record.engineer}</strong>

    </div>

    <div class="project-cell">

        <span>Area</span>

        <strong>${parseFloat(record.area)}㎡</strong>

    </div>

    <div class="project-cell">

        <span>Date From–To</span>

        <strong>

            ${formatShortDate(record.workFrom)} - ${formatShortDate(record.workTo)}

        </strong>

    </div>

    <div class="project-cell">

        <span>Date Paid</span>

        <strong>

            ${formatShortDate(record.datePaid)}

        </strong>

    </div>

    <div class="project-cell">

        <span>Status</span>

        <strong class="${record.status === "Paid" ? "paid-status" : "pending-status"}">

            ${record.status}

        </strong>

    </div>

    <div class="project-cell">

        <span>Salary</span>

        <strong>

            ¥${Number(record.amount).toLocaleString()}

        </strong>

    </div>

    <div class="project-actions">

        <span
            class="editSalaryBtn"
            data-index="${index}">

            Edit

        </span>

        <span
            class="deleteSalaryBtn"
            data-index="${index}">

            Delete

        </span>

    </div>

</div>

`;

    });

    let totalSalary = 0;

    let totalArea = 0;

    let totalWorkDays = 0;

    filteredSalary.forEach(record=>{

        totalSalary += Number(record.amount) || 0;

        totalArea += Number(record.area) || 0;

        totalWorkDays += getWorkDays(

            record.workFrom,

            record.workTo

        );

    });

    document.getElementById("reportTotalSalary").textContent =
        "¥" + totalSalary.toLocaleString();

    document.getElementById("reportTotalProjects").textContent =
        filteredSalary.length;

    document.getElementById("reportTotalArea").textContent =
        totalArea.toFixed(2) + "㎡";

    document.getElementById("reportTotalWorkdays").textContent =
        totalWorkDays;

}

/* ==========================================================
   SALARY SEARCH
========================================================== */

document.getElementById("salarySearch")
.addEventListener("input", function(){

    renderSalaryReports();

});

/* ==========================================================
   SALARY TABLE EVENTS
========================================================== */

document.addEventListener("click", async function(e){

    /* EDIT */

    if(e.target.classList.contains("editSalaryBtn")){

        const index = Number(e.target.dataset.index);

const record = salaryRecords[index];

if (!record) return;

editingSalaryIndex = record.id;

salaryEngineer.value = record.engineer;

salaryLocation.value = record.location || "";

salaryBuilding.value = record.building;

workFrom.value = record.workFrom;

workTo.value = record.workTo;

salaryArea.value = record.area;

salaryAmount.value = record.amount;

salaryDate.value = record.datePaid;

salaryStatus.value = record.status;

showPage("salary");

return;

    }

    /* DELETE */

    if(e.target.classList.contains("deleteSalaryBtn")){

        const index = Number(e.target.dataset.index);

const record = salaryRecords[index];

if (!record) return;

const confirmDelete = confirm(
    "Are you sure you want to delete this payment?"
);

if (!confirmDelete) return;

const { error } = await window.db
    .from("salary_records")
    .delete()
    .eq("id", record.id);

if (error) {

    alert(error.message);

    return;

}

await renderSalaryReports();

    }

});

/* ==========================================================
   SECTION 13
   PROFILE JAVASCRIPT
========================================================== */


/* ==========================================================
   PROFILE ELEMENTS
========================================================== */

const editProfileBtn = document.getElementById("editProfileBtn");

const profileInputs = document.querySelectorAll(
    "#profilePage input, #profilePage select"
);


const profileViews = document.querySelectorAll(
    "#profilePage span[id^='view']"
);


let profileEditMode = false;



/* ==========================================================
   EDIT PROFILE MODE
========================================================== */

editProfileBtn.addEventListener("click", async function(){


    profileEditMode = !profileEditMode;



    if(profileEditMode){


        profileInputs.forEach(input=>{

            input.style.display = "block";

        });


        profileViews.forEach(view=>{

            view.style.display = "none";

        });


        editProfileBtn.innerHTML =
        '<i class="fas fa-save"></i> Save Profile';



    }else{

        const profileData = {

    fullName: document.getElementById("profileFullName").value,
    position: document.getElementById("profilePosition").value,
    phone: document.getElementById("profilePhone").value,
    email: document.getElementById("profileEmail").value,
    address: document.getElementById("profileAddress").value,
    birthday: document.getElementById("profileBirthday").value,
    gender: document.getElementById("profileGender").value,
    civil: document.getElementById("profileCivil").value,

    hired: document.getElementById("profileHired").value,
    employment: document.getElementById("profileEmployment").value,
    specialization: document.getElementById("profileSpecialization").value,
    team: document.getElementById("profileTeam").value,
    project: document.getElementById("profileProject").value,
    supervisor: document.getElementById("profileSupervisor").value

};

const currentUser = localStorage.getItem("currentUser");

const { error } = await window.db
    .from("profiles")
    .update({

        full_name: profileData.fullName,

        email: profileData.email,

        position: profileData.position,

        phone: profileData.phone,

        address: profileData.address,

        birthday: profileData.birthday,

        gender: profileData.gender,

        civil: profileData.civil,

        hired: profileData.hired,

        employment: profileData.employment,

        specialization: profileData.specialization,

        team: profileData.team,

        project: profileData.project,

        supervisor: profileData.supervisor

    })
    .eq("id", currentUser);

    if (error) {

    alert(error.message);

    return;

}

const initials = profileData.fullName
    .trim()
    .split(/\s+/)
    .map(name => name.charAt(0).toUpperCase())
    .join("");

document.getElementById("profileImage").textContent = initials;

/* ===========================
   UPDATE VIEW VALUES
=========================== */

/* PERSONAL INFORMATION */

document.getElementById("viewFullName").textContent =
document.getElementById("profileFullName").value || "-";

document.getElementById("profileUsername").textContent =
document.getElementById("profileFullName").value || "Full Name";

document.getElementById("viewPosition").textContent =
document.getElementById("profilePosition").value || "-";

document.getElementById("profileRole").textContent =
document.getElementById("profilePosition").value || "-";

document.getElementById("viewPhone").textContent =
document.getElementById("profilePhone").value || "-";

document.getElementById("viewEmail").textContent =
document.getElementById("profileEmail").value || "-";

document.getElementById("viewAddress").textContent =
document.getElementById("profileAddress").value || "-";

document.getElementById("viewBirthday").textContent =
document.getElementById("profileBirthday").value || "-";

document.getElementById("viewGender").textContent =
document.getElementById("profileGender").value || "-";

document.getElementById("viewCivil").textContent =
document.getElementById("profileCivil").value || "-";


/* WORK INFORMATION */

document.getElementById("viewHired").textContent =
document.getElementById("profileHired").value || "-";

document.getElementById("viewEmployment").textContent =
document.getElementById("profileEmployment").value || "-";

document.getElementById("viewSpecialization").textContent =
document.getElementById("profileSpecialization").value || "-";

document.getElementById("viewTeam").textContent =
document.getElementById("profileTeam").value || "-";

document.getElementById("viewProject").textContent =
document.getElementById("profileProject").value || "-";

document.getElementById("viewSupervisor").textContent =
document.getElementById("profileSupervisor").value || "-";


/* RETURN TO VIEW MODE */

profileInputs.forEach(input => {

    input.style.display = "none";

});

profileViews.forEach(view => {

    view.style.display = "flex";

});

editProfileBtn.innerHTML =
'<i class="fas fa-user-edit"></i> Edit Profile';

alert("Profile Saved Successfully!");


    }


});

/* ==========================================================
   UPDATE DASHBOARD GREETING
========================================================== */

async function updateGreeting(){

    const currentUser = localStorage.getItem("currentUser");

const { data: account, error } = await window.db
    .from("profiles")
    .select("full_name")
    .eq("id", currentUser)
    .single();

if(error || !account) return;

    const firstName = (account.full_name || "").split(" ")[0];

    const hour = new Date().getHours();

    let greeting = "";

    if(hour < 12){

        greeting = "Good Morning";

    }else if(hour < 18){

        greeting = "Good Afternoon";

    }else{

        greeting = "Good Evening";

    }

   document.getElementById("greeting").textContent = greeting;

document.getElementById("displayName").textContent = firstName;

}

/* ==========================================================
   LOAD PERSONAL INFORMATION
========================================================== */

 async function loadCurrentUserProfile(){

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        console.log("No current user. Skip loading profile.");
        return;
    }

    const { data: currentAccount, error } = await window.db
        .from("profiles")
        .select("*")
        .eq("id", currentUser)
        .single();

if (error || !currentAccount) {

    console.error(error);

    return;

}

const savedProfile = currentAccount;

/* ==========================================================
   PROFILE AVATAR
========================================================== */

const profileImage = document.getElementById("profileImage");

if(profileImage){

    // Always reset first
    profileImage.style.backgroundImage = "none";
    profileImage.style.backgroundSize = "";
    profileImage.style.backgroundPosition = "";
    profileImage.textContent = "";

    const savedAvatar = currentAccount.avatar_url;

    if(savedAvatar){

        profileImage.style.backgroundImage = `url(${savedAvatar})`;
        profileImage.style.backgroundSize = "cover";
        profileImage.style.backgroundPosition = "center";

    }else{

        const fullName =
    currentAccount.full_name ||
    currentAccount.username ||
    "";

        const initials = fullName
            .trim()
            .split(/\s+/)
            .map(name => name.charAt(0).toUpperCase())
            .join("");

        profileImage.textContent = initials;

    }

}

/* ==========================================================
   LOAD LOGIN ACCOUNT INFORMATION
========================================================== */

if(currentAccount){

    document.getElementById("profileFullName").value =
        currentAccount.full_name || "";

    document.getElementById("viewFullName").textContent =
        currentAccount.full_name || "-";

    document.getElementById("profileUsername").textContent =
        currentAccount.full_name || currentAccount.username || "Full Name";

    document.getElementById("profileEmail").value =
        currentAccount.email || "";

    document.getElementById("viewEmail").textContent =
        currentAccount.email || "-";

}

/* ==========================================================
   LOAD SAVED PROFILE
========================================================== */

if(savedProfile){

    /* PERSONAL INFORMATION */

    document.getElementById("profileFullName").value =
        savedProfile.full_name || "";

    document.getElementById("viewFullName").textContent =
        savedProfile.full_name || "-";

    document.getElementById("profileUsername").textContent =
        savedProfile.full_name || savedProfile.username || "Full Name";

    document.getElementById("profilePosition").value =
        savedProfile.position || "Owner";

    document.getElementById("viewPosition").textContent =
        savedProfile.position || "-";

    document.getElementById("profileRole").textContent =
        savedProfile.position || "-";

    document.getElementById("profilePhone").value =
        savedProfile.phone || "";

    document.getElementById("viewPhone").textContent =
        savedProfile.phone || "-";

    document.getElementById("profileEmail").value =
        savedProfile.email || "";

    document.getElementById("viewEmail").textContent =
        savedProfile.email || "-";

    document.getElementById("profileAddress").value =
        savedProfile.address || "";

    document.getElementById("viewAddress").textContent =
        savedProfile.address || "-";

    document.getElementById("profileBirthday").value =
        savedProfile.birthday || "";

    document.getElementById("viewBirthday").textContent =
        savedProfile.birthday || "-";

    document.getElementById("profileGender").value =
        savedProfile.gender || "Male";

    document.getElementById("viewGender").textContent =
        savedProfile.gender || "-";

    document.getElementById("profileCivil").value =
        savedProfile.civil || "Single";

    document.getElementById("viewCivil").textContent =
        savedProfile.civil || "-";

    /* WORK INFORMATION */

    document.getElementById("profileHired").value =
        savedProfile.hired || "";

    document.getElementById("viewHired").textContent =
        savedProfile.hired || "-";

    document.getElementById("profileEmployment").value =
        savedProfile.employment || "Regular";

    document.getElementById("viewEmployment").textContent =
        savedProfile.employment || "-";

    document.getElementById("profileSpecialization").value =
        savedProfile.specialization || "";

    document.getElementById("viewSpecialization").textContent =
        savedProfile.specialization || "-";

    document.getElementById("profileTeam").value =
        savedProfile.team || "";

    document.getElementById("viewTeam").textContent =
        savedProfile.team || "-";

    document.getElementById("profileProject").value =
        savedProfile.project || "";

    document.getElementById("viewProject").textContent =
        savedProfile.project || "-";

    document.getElementById("profileSupervisor").value =
        savedProfile.supervisor || "";

    document.getElementById("viewSupervisor").textContent =
        savedProfile.supervisor || "-";

}

/* ==========================================================
   LOAD USER SETTINGS
========================================================== */

document.getElementById("languageSelect").value =
    currentAccount.language || "en";

document.getElementById("currencySelect").value =
    currentAccount.currency || "JPY (¥)";

document.getElementById("dateFormat").value =
    currentAccount.date_format || "YYYY-MM-DD";

document.getElementById("timeFormat").value =
    currentAccount.time_format || "24 Hours";

const accentColor =
    currentAccount.accent_color || "#D4AF37";

document.getElementById("accentColorPicker").value =
    accentColor;

document.getElementById("accentColorHex").value =
    accentColor;

document.documentElement.style.setProperty(
    "--gold",
    accentColor
);

}

/* ==========================================================
   PROFILE AVATAR
========================================================== */

const profileImage = document.getElementById("profileImage");

profileImage.style.backgroundImage = "none";
profileImage.textContent = "";

const uploadAvatar = document.getElementById("uploadAvatar");

const avatarCropModal = document.getElementById("avatarCropModal");

const cropImage = document.getElementById("cropImage");

const cancelCropBtn = document.getElementById("cancelCropBtn");

const applyCropBtn = document.getElementById("applyCropBtn");

let cropper = null;

/* ==========================================================
   OPEN FILE WHEN AVATAR CLICKED
========================================================== */

if (profileImage && uploadAvatar) {

    profileImage.addEventListener("click", () => {

        uploadAvatar.click();

    });

}


/* ==========================================================
   SELECT IMAGE
========================================================== */

if (uploadAvatar) {

    uploadAvatar.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        cropImage.src = event.target.result;

        avatarCropModal.style.display = "flex";

        if(cropper){

            cropper.destroy();

        }

        cropper = new Cropper(cropImage,{

            aspectRatio:1,
            viewMode:1,
            dragMode:"move",
            autoCropArea:1,
            responsive:true,
            background:false

        });

    };

    reader.readAsDataURL(file);

});

}

/* ==========================================================
   CANCEL CROP
========================================================== */

if (cancelCropBtn) {

    cancelCropBtn.addEventListener("click", function(){

        avatarCropModal.style.display = "none";

    if(cropper){

        cropper.destroy();

        cropper = null;

    }

});

}

/* ==========================================================
   APPLY CROP
========================================================== */

if (applyCropBtn) {

    applyCropBtn.addEventListener("click", async function(){

    if(!cropper) return;

    const canvas = cropper.getCroppedCanvas({

        width:300,
        height:300

    });

    const imageData = canvas.toDataURL("image/png");

const currentUser = localStorage.getItem("currentUser");

await window.db
    .from("profiles")
    .update({
        avatar_url: imageData
    })
    .eq("id", currentUser);

// Update avatar immediately
profileImage.textContent = "";

profileImage.style.backgroundImage = `url(${imageData})`;

profileImage.style.backgroundSize = "cover";

profileImage.style.backgroundPosition = "center";

    avatarCropModal.style.display = "none";

    cropper.destroy();

    cropper = null;

});

}

/* ==========================================================
   SETTINGS
   SHOW / HIDE PASSWORD
========================================================== */

document.querySelectorAll(".toggle-password").forEach(icon=>{

    icon.addEventListener("click",()=>{

        const input=document.getElementById(icon.dataset.target);

        if(input.type==="password"){

            input.type="text";

            icon.classList.remove("fa-eye");

            icon.classList.add("fa-eye-slash");

        }else{

            input.type="password";

            icon.classList.remove("fa-eye-slash");

            icon.classList.add("fa-eye");

        }

    });

});

/* ==========================================================
   LOGOUT
========================================================== */

logoutNav.addEventListener("click", async () => {

    /* ==========================
       REMEMBER ME STATUS
    ========================== */

    const rememberMe =
        document.getElementById("rememberMe");

    const keepUsername =
        rememberMe && rememberMe.checked;

    /* ==========================
       SUPABASE SIGN OUT
    ========================== */

    await window.db.auth.signOut();

    /* ==========================
       CLEAR LOCAL SESSION
    ========================== */

    localStorage.removeItem("currentUser");
    localStorage.removeItem("authPage");

    if (!keepUsername) {

        localStorage.removeItem("rememberUsername");

    }

    /* ==========================
       SHOW LOGIN PAGE
    ========================== */

    document.getElementById("mainApp").style.display = "none";
    document.getElementById("registerPage").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";

    /* ==========================
       RESTORE LOGIN FORM
    ========================== */

    const rememberedUsername =
        localStorage.getItem("rememberUsername");

    document.getElementById("password").value = "";

    if (rememberedUsername) {

        document.getElementById("username").value =
            rememberedUsername;

        document.getElementById("rememberMe").checked = true;

    } else {

        document.getElementById("username").value = "";

        document.getElementById("rememberMe").checked = false;

    }

});

/* ==========================================================
   REGISTER FORM
========================================================== */

const registerForm = document.getElementById("registerForm");

if(registerForm){

    registerForm.addEventListener("submit", async function(e){

        e.preventDefault();

        const fullName = document.getElementById("registerFullName");
        const email = document.getElementById("registerEmail");
        const username = document.getElementById("registerUsername");
        const password = document.getElementById("registerPassword");
        const confirmPassword = document.getElementById("registerConfirmPassword");

        const fullNameError = document.getElementById("registerFullNameError");
        const emailError = document.getElementById("registerEmailError");
        const usernameError = document.getElementById("registerUsernameError");
        const passwordError = document.getElementById("registerPasswordError");
        const confirmPasswordError = document.getElementById("registerConfirmPasswordError");

        // RESET

        [
            fullName,
            email,
            username,
            password,
            confirmPassword

        ].forEach(input=>input.classList.remove("error"));

        [
            fullNameError,
            emailError,
            usernameError,
            passwordError,
            confirmPasswordError

        ].forEach(error=>{

            error.textContent="";

            error.classList.remove("show");

        });

        let valid = true;

        // FULL NAME

        if(fullName.value.trim()===""){

            fullName.classList.add("error");

            fullNameError.textContent="Please enter your full name.";

            fullNameError.classList.add("show");

            valid=false;

        }

        // EMAIL

        if(email.value.trim()===""){

            email.classList.add("error");

            emailError.textContent="Please enter your email.";

            emailError.classList.add("show");

            valid=false;

        }else{

            const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if(!emailPattern.test(email.value.trim())){

                email.classList.add("error");

                emailError.textContent="Invalid email address.";

                emailError.classList.add("show");

                valid=false;

            }

        }

        // USERNAME

        if(username.value.trim()===""){

            username.classList.add("error");

            usernameError.textContent="Please enter your username.";

            usernameError.classList.add("show");

            valid=false;

        }

        // PASSWORD

        if(password.value===""){

            password.classList.add("error");

            passwordError.textContent="Please enter your password.";

            passwordError.classList.add("show");

            valid=false;

        }

        // CONFIRM PASSWORD

        if(confirmPassword.value===""){

            confirmPassword.classList.add("error");

            confirmPasswordError.textContent="Please confirm your password.";

            confirmPasswordError.classList.add("show");

            valid=false;

        }

        // PASSWORD MATCH

        if(
            password.value!=="" &&
            confirmPassword.value!=="" &&
            password.value!==confirmPassword.value
        ){

            confirmPassword.classList.add("error");

            confirmPasswordError.textContent="Passwords do not match.";

            confirmPasswordError.classList.add("show");

            valid=false;

        }

        if(!valid){

    return;

}

// ==========================================
// REGISTER USING SUPABASE AUTH
// ==========================================

const { data, error } = await window.db.auth.signUp({

    email: email.value.trim(),

    password: password.value,

    options: {

        data: {

            full_name: fullName.value.trim(),

            username: username.value.trim()

        }

    }

});

if (error) {

    alert(error.message);

    return;

}

const { error: profileInsertError } =
    await window.db
        .from("profiles")
        .insert({

            id: data.user.id,

            full_name: fullName.value.trim(),

            username: username.value.trim(),

            email: email.value.trim(),

            position: null,

            avatar_url: null

        });

if (profileInsertError) {

    alert(profileInsertError.message);

    return;

}

alert("Account created successfully! You can now log in.");

registerForm.reset();

document.getElementById("registerPage").style.display = "none";

document.getElementById("loginPage").style.display = "flex";

    });

}

/* ==========================================================
   AUTO LOGIN (SUPABASE)
========================================================== */

(async function () {

    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");
    const mainApp = document.getElementById("mainApp");

    const authPage =
        localStorage.getItem("authPage") || "login";

    const { data } =
        await window.db.auth.getSession();

    const session = data.session;

    console.log("SESSION:", session);

    if (session) {

        localStorage.setItem(
            "currentUser",
            session.user.id
        );

        loginPage.style.display = "none";
        registerPage.style.display = "none";
        mainApp.style.display = "flex";

        await loadCurrentUserProfile();

        await updateGreeting();

        renderRecentSchedule();
        renderHistoryTable();
        updateTodaySchedule();
        updateDashboardSummary();
        updateMonthlyOverview();

        const lastPage =
            localStorage.getItem(
                "activePage_" + session.user.id
            ) || "dashboard";

        showPage(lastPage);

        return;

    }

    localStorage.removeItem("currentUser");

    mainApp.style.display = "none";

    if (authPage === "register") {

        loginPage.style.display = "none";
        registerPage.style.display = "flex";

    } else {

        registerPage.style.display = "none";
        loginPage.style.display = "flex";

    }

})();

/* ==========================================================
   REMEMBER ME
========================================================== */

const rememberedUsername =
    localStorage.getItem("rememberUsername");

const rememberCheckbox =
    document.getElementById("rememberMe");

const usernameInput =
    document.getElementById("username");

if(rememberedUsername){

    usernameInput.value = rememberedUsername;

    rememberCheckbox.checked = true;

}else{

    rememberCheckbox.checked = false;

}

/* ==========================================================
   LOGIN ↔ REGISTER PAGE
========================================================== */

const showRegister = document.getElementById("showRegister");

const backToLogin = document.getElementById("backToLogin");

if(showRegister){

    showRegister.addEventListener("click",(e)=>{

    e.preventDefault();

    localStorage.setItem("authPage","register");

    document.getElementById("loginPage").style.display="none";

    document.getElementById("registerPage").style.display="flex";

});

}

if(backToLogin){

    backToLogin.addEventListener("click",(e)=>{

    e.preventDefault();

    localStorage.setItem("authPage","login");

    document.getElementById("registerPage").style.display="none";

    document.getElementById("loginPage").style.display="flex";

});

}

/* ==========================================================
   CHANGE PASSWORD
========================================================== */

const changePasswordBtn =
document.getElementById("changePasswordBtn");

if(changePasswordBtn){

    changePasswordBtn.addEventListener("click", async function(){

        const newPassword =
            document.getElementById("newPassword").value.trim();

        const confirmPassword =
            document.getElementById("confirmPassword").value.trim();

        if(newPassword === "" || confirmPassword === ""){

            alert("Please complete all password fields.");
            return;

        }

        if(newPassword !== confirmPassword){

            alert("New password and confirm password do not match.");
            return;

        }

        const { error } =
            await window.db.auth.updateUser({

                password: newPassword

            });

        if(error){

            alert(error.message);
            return;

        }

        alert("Password changed successfully.");

        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";

    });

}

/* ==========================================================
   USER SETTINGS (SUPABASE)
========================================================== */

const languageSelect = document.getElementById("languageSelect");
const currencySelect = document.getElementById("currencySelect");
const dateFormat = document.getElementById("dateFormat");
const timeFormat = document.getElementById("timeFormat");
const accentColorPicker = document.getElementById("accentColorPicker");
const accentColorHex = document.getElementById("accentColorHex");

/* ==========================
   LANGUAGE
========================== */

if(languageSelect){

    languageSelect.addEventListener("change", async function(){

        const currentUser = localStorage.getItem("currentUser");

        await window.db
            .from("profiles")
            .update({
                language: this.value
            })
            .eq("id", currentUser);

    });

}

/* ==========================
   CURRENCY
========================== */

if(currencySelect){

    currencySelect.addEventListener("change", async function(){

        const currentUser = localStorage.getItem("currentUser");

        await window.db
            .from("profiles")
            .update({
                currency: this.value
            })
            .eq("id", currentUser);

    });

}

/* ==========================
   DATE FORMAT
========================== */

if(dateFormat){

    dateFormat.addEventListener("change", async function(){

        const currentUser = localStorage.getItem("currentUser");

        await window.db
            .from("profiles")
            .update({
                date_format: this.value
            })
            .eq("id", currentUser);

    });

}

/* ==========================
   TIME FORMAT
========================== */

if(timeFormat){

    timeFormat.addEventListener("change", async function(){

        const currentUser = localStorage.getItem("currentUser");

        await window.db
            .from("profiles")
            .update({
                time_format: this.value
            })
            .eq("id", currentUser);

    });

}

/* ==========================
   ACCENT COLOR
========================== */

if(accentColorPicker && accentColorHex){

    accentColorPicker.addEventListener("input", async function(){

        const currentUser = localStorage.getItem("currentUser");

        accentColorHex.value = this.value;

        document.documentElement.style.setProperty(
            "--gold",
            this.value
        );

        await window.db
            .from("profiles")
            .update({
                accent_color: this.value
            })
            .eq("id", currentUser);

    });

    accentColorHex.addEventListener("input", async function(){

        if(/^#[0-9A-Fa-f]{6}$/.test(this.value)){

            const currentUser = localStorage.getItem("currentUser");

            accentColorPicker.value = this.value;

            document.documentElement.style.setProperty(
                "--gold",
                this.value
            );

            await window.db
                .from("profiles")
                .update({
                    accent_color: this.value
                })
                .eq("id", currentUser);

        }

    });

}

/* ==========================================================
   EXPORT DATA (PER USER)
========================================================== */

const exportDataBtn =
document.getElementById("exportDataBtn");

if(exportDataBtn){

    exportDataBtn.addEventListener("click", function(){

        const currentUser =
        localStorage.getItem("currentUser");

        if(!currentUser){

            alert("No user is currently logged in.");

            return;

        }

        const backup = {

            version: "1.0",

            exportDate: new Date().toISOString(),

            username: currentUser,

            data:{

                schedules:
                    JSON.parse(
                        localStorage.getItem(
                            "ygcSchedules_" + currentUser
                        )
                    ) || [],

                salary:
                    JSON.parse(
                        localStorage.getItem(
                            "salaryRecords_" + currentUser
                        )
                    ) || [],

                profile:
                    JSON.parse(
                        localStorage.getItem(
                            "profileData_" + currentUser
                        )
                    ) || {},

                avatar:
                    localStorage.getItem(
                        "profileAvatar_" + currentUser
                    ) || "",

                language:
                    localStorage.getItem(
                        "language_" + currentUser
                    ) || "en",

                currency:
                    localStorage.getItem(
                        "currency_" + currentUser
                    ) || "JPY (¥)",

                dateFormat:
                    localStorage.getItem(
                        "dateFormat_" + currentUser
                    ) || "YYYY-MM-DD",

                timeFormat:
                    localStorage.getItem(
                        "timeFormat_" + currentUser
                    ) || "24 Hours",

                accentColor:
                    localStorage.getItem(
                        "accentColor_" + currentUser
                    ) || "#D4AF37"

            }

        };

        const blob = new Blob(

            [
                JSON.stringify(
                    backup,
                    null,
                    2
                )
            ],

            {
                type:"application/json"
            }

        );

        const url =
        URL.createObjectURL(blob);

        const a =
        document.createElement("a");

        a.href = url;

        a.download =
        currentUser +
        "_backup.json";

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        alert("Backup exported successfully.");

    });

}

/* ==========================================================
   IMPORT DATA (PER USER)
========================================================== */

const importDataBtn =
document.getElementById("importDataBtn");

const importFile =
document.getElementById("importFile");

if(importDataBtn && importFile){

    importDataBtn.addEventListener("click",function(){

        importFile.click();

    });

    importFile.addEventListener("change",function(e){

        const file = e.target.files[0];

        if(!file) return;

        const reader = new FileReader();

        reader.onload = function(event){

            try{

                const backup =
                JSON.parse(event.target.result);

                const currentUser =
                localStorage.getItem("currentUser");

                if(!backup.data){

                    alert("Invalid backup file.");

                    return;

                }

                localStorage.setItem(
                    "ygcSchedules_" + currentUser,
                    JSON.stringify(
                        backup.data.schedules || []
                    )
                );

                localStorage.setItem(
                    "salaryRecords_" + currentUser,
                    JSON.stringify(
                        backup.data.salary || []
                    )
                );

                localStorage.setItem(
                    "profileData_" + currentUser,
                    JSON.stringify(
                        backup.data.profile || {}
                    )
                );

                localStorage.setItem(
                    "profileAvatar_" + currentUser,
                    backup.data.avatar || ""
                );

                localStorage.setItem(
                    "language_" + currentUser,
                    backup.data.language || "en"
                );

                localStorage.setItem(
                    "currency_" + currentUser,
                    backup.data.currency || "JPY (¥)"
                );

                localStorage.setItem(
                    "dateFormat_" + currentUser,
                    backup.data.dateFormat || "YYYY-MM-DD"
                );

                localStorage.setItem(
                    "timeFormat_" + currentUser,
                    backup.data.timeFormat || "24 Hours"
                );

                localStorage.setItem(
                    "accentColor_" + currentUser,
                    backup.data.accentColor || "#D4AF37"
                );

                alert(
                    "Backup imported successfully!\n\nThe application will now reload."
                );

                location.reload();

            }catch(error){

                alert("Invalid backup file.");

            }

        };

        reader.readAsText(file);

    });

}

/* ==========================================================
   DELETE ACCOUNT
   DELETE CURRENT USER
========================================================== */

const deleteAccountBtn =
document.getElementById("deleteAccountBtn");

if(deleteAccountBtn){

    deleteAccountBtn.addEventListener("click", async () => {

        const confirmDelete = confirm(

    "Reset your account?\n\n" +
    "This will permanently delete all your schedules, salary records, profile information, and settings.\n\n" +
    "Your login account will remain available."

);

        if(!confirmDelete) return;

        const currentUser =
        localStorage.getItem("currentUser");

/* ===============================
   DELETE USER DATA (SUPABASE)
=============================== */

await window.db
    .from("salary_records")
    .delete()
    .eq("user_id", currentUser);

await window.db
    .from("schedules")
    .delete()
    .eq("user_id", currentUser);

await window.db
    .from("profiles")
    .update({

        position: null,
        phone: null,
        address: null,
        birthday: null,
        gender: null,
        civil: null,
        hired: null,
        employment: null,
        specialization: null,
        team: null,
        project: null,
        supervisor: null,
        avatar_url: null

    })
    .eq("id", currentUser);

        /* ===============================
           REMOVE USER DATA
        =============================== */

        localStorage.removeItem(
            "profileData_" + currentUser
        );

        localStorage.removeItem(
            "ygcSchedules_" + currentUser
        );

        localStorage.removeItem(
            "salaryRecords_" + currentUser
        );

        localStorage.removeItem(
            "accentColor_" + currentUser
        );

        localStorage.removeItem(
            "language_" + currentUser
        );

        localStorage.removeItem(
            "currency_" + currentUser
        );

        localStorage.removeItem(
            "dateFormat_" + currentUser
        );

        localStorage.removeItem(
            "timeFormat_" + currentUser
        );

        /* ===============================
           LOGOUT
        =============================== */

        localStorage.removeItem("currentUser");
localStorage.removeItem("ygcLoggedIn");

alert("Account has been reset successfully.");

document.getElementById("mainApp").style.display = "none";

document.getElementById("loginPage").style.display = "flex";

document.getElementById("username").value = "";
document.getElementById("password").value = "";

return;

    });

}

/* ==========================================================
   EXPORT HISTORY TO EXCEL (PER USER)
========================================================== */

const exportHistoryExcelBtn =
document.getElementById("exportHistoryExcelBtn");

if(exportHistoryExcelBtn){

    exportHistoryExcelBtn.addEventListener("click", async function(){

        const currentUser =
        localStorage.getItem("currentUser");

        if(!currentUser){

            alert("No user logged in.");

            return;

        }

        const { data: schedules, error } = await window.db
    .from("schedules")
    .select("*")
    .eq("user_id", currentUser);

if (error) {

    alert(error.message);

    return;

}

        if(schedules.length === 0){

            alert("No history data found.");

            return;

        }

        const excelData = schedules.map(item => ({

    Date: item.date || "",

    Location: item.location || "",

    Building: item.building || "",

    Engineer: item.engineer || "",

    "Gene Con.": item.gene_con || "",

    "Flooring Type": item.flooring_type || "",

    "Schedule Type": item.schedule_type || "",

    "Time In": item.time_in || "",

    "Time Out": item.time_out || "",

    Notes: item.notes || ""

}));

        const worksheet =
        XLSX.utils.json_to_sheet(excelData);

        const workbook =
        XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "History"

        );

        const today =
        new Date().toISOString().split("T")[0];

        XLSX.writeFile(

            workbook,

            `${currentUser}_History_${today}.xlsx`

        );

    });

}

/* ==========================================================
   EXPORT REPORTS TO EXCEL (PER USER)
========================================================== */

const exportReportsExcelBtn =
document.getElementById("exportReportsExcelBtn");

if(exportReportsExcelBtn){

    exportReportsExcelBtn.addEventListener("click", async function(){

        const currentUser =
        localStorage.getItem("currentUser");

        if(!currentUser){

            alert("No user logged in.");

            return;

        }

        const { data: salaryRecords, error } = await window.db
    .from("salary_records")
    .select("*")
    .eq("user_id", currentUser);

if (error) {

    alert(error.message);

    return;

}

        if(salaryRecords.length === 0){

            alert("No salary reports found.");

            return;

        }

        const excelData = salaryRecords.map(record => ({

    "Date Paid": record.date_paid || "",

    Location: record.location || "",

    Building: record.building || "",

    Engineer: record.engineer || "",

    "Work From": record.work_from || "",

    "Work To": record.work_to || "",

    "Area (㎡)": record.area || "",

    Salary: record.amount || "",

    Status: record.status || ""

}));

// ==========================
// REPORT SUMMARY
// ==========================

let totalSalary = 0;
let totalArea = 0;

salaryRecords.forEach(record => {

    totalSalary += Number(record.amount) || 0;

    totalArea += Number(record.area) || 0;

});

excelData.push({});

excelData.push({

    "Date Paid": "TOTAL",

    Location: "",

    Building: "",

    Engineer: "",

    "Work From": "",

    "Work To": "",

    "Area (㎡)": totalArea.toFixed(2),

    Salary: totalSalary,

    Status: ""

});

        const worksheet =
        XLSX.utils.json_to_sheet(excelData);

        const workbook =
        XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "Reports"

        );

        const today =
        new Date().toISOString().split("T")[0];

        XLSX.writeFile(

            workbook,

            `${currentUser}_Reports_${today}.xlsx`

        );

    });

}

/* ==========================================================
   PWA
   SERVICE WORKER
========================================================== */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./service-worker.js")

            .then(() => {

                console.log("✅ Service Worker Registered");

            })

            .catch(err => {

                console.log("❌ Service Worker Failed", err);

            });

    });

}