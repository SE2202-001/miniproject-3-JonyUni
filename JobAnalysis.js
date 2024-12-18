//load all the elements
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const fileNameSpan = document.getElementById('fileName');
const jsonList = document.getElementById("jsonList");
const levelFilter = document.getElementById("levelFilter");
const typeFilter = document.getElementById("typeFilter");
const skillFilter = document.getElementById("skillFilter");
const filterButton = document.getElementById("filterButton");
const sortButton = document.getElementById("sortButton");
const sortMenu = document.getElementById("sortMenu");

let jobs = [];//holds all the jobs
let filterJobs = [];//holds the displayed jobs

uploadButton.addEventListener('click', () => {
    fileInput.click();
})

//sorting
sortButton.addEventListener('click', () => {
    jsonList.innerHTML = '';//reset the list
    //sort by title(a-z)
    if(sortMenu.value == "title"){
        filterJobs.sort((a,b) => {
            return a.title.localeCompare(b.title);
        })
    }
    //sort by time posted
    if(sortMenu.value == "time"){
        filterJobs.sort((a,b) => {
            return a.time-b.time;
        })
    }
    //sort by time posted oldest first
    if(sortMenu.value == "timeOldest"){
        filterJobs.sort((a,b) => {
            return b.time-a.time;
        })
    }
    //sort by title z-a
    if(sortMenu.value == "titleZ"){
        filterJobs.sort((a,b) => {
            return b.title.localeCompare(a.title);
        })
    }
    //display the sorted jobs
    filterJobs.forEach(job =>{
        jsonList.appendChild(job.display());
    })
})

//filter jobs
filterButton.addEventListener('click', () =>{
    jsonList.innerHTML = '';//reset displayed jobs
    filterJobs = [];

    //filter all the jobs for selected criteria
    filterJobs = jobs.filter(job => {
        const matchesLevel = levelFilter.value === "all" || job.level === levelFilter.value;
        const matchesType = typeFilter.value === "all" || job.type === typeFilter.value;
        const matchesSkill = skillFilter.value === "all" || job.skill === skillFilter.value;
        return matchesLevel && matchesType && matchesSkill;
    })

    //display the jobs
    filterJobs.forEach(job =>{
        jsonList.appendChild(job.display());
    })
    //show no jobs availible
    if(filterJobs.length===0){
        jsonList.innerHTML= 'No jobs available';
    }
})

//Display jobs on input
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0]//file with the jobs
        fileNameSpan.textContent = file.name;//display the name of the file

        const reader = new FileReader();

        //display the jobs after reading the file
        reader.onload = function(e){
            try{
                jsonList.innerHTML = '';
                jobs = [];
                const jsonData = JSON.parse(e.target.result)
                populateDropDown(jsonData)//dynamicly fills out the drop downs
                //creates the job objects from the JSON objects
                jsonData.forEach((item, index) => {
                        //checks if a job is missing  any atributes
                        const requiredAttributes = ["Title", "Type", "Level", "Skill", "Detail", "Posted"];
                        const missingAttributes = requiredAttributes.filter(attr => item[attr] === undefined || item[attr] === null);
                        if (missingAttributes.length > 0) {
                            alert(`Job #${index + 1}, ${item.Title} is missing attributes: ${missingAttributes.join(", ")}`);
                            return; // Skip this job item
                        }

                        let jobItem = new Job(item.Title,item.Type,item.Level,item.Skill,item.Detail,item.Posted)
                        jobs.push(jobItem)
                        jsonList.appendChild(jobItem.display());
                })
            }catch{
                //if there is a problem with the file an alert is shown
                alert("Invalid JSON file")
            }
            filterJobs = jobs;
        }
        reader.readAsText(file);
     } else {
        //if there is no file no file name is displayed
        fileNameSpan.textContent = '';}
})

//populates the drop down menu
function populateDropDown(data){
    //creates sets for all the filters
    const levels = new Set();
    const types = new Set();
    const skills = new Set();

    //adds all the different types of attributes to the sets
    data.forEach(job => {
        if (job.Level) levels.add(job.Level);
        if (job.Type) types.add(job.Type);
        if (job.Skill) skills.add(job.Skill)
    })

    //updates the drop downs
    updateDropDown(levelFilter,levels);
    updateDropDown(typeFilter,types);
    updateDropDown(skillFilter,skills);
}

//updates the drop downs
function updateDropDown(element, values){
    //clears the dropdowns apart from the all option
    const options = element.querySelectorAll('option:not([value="all"])');
    options.forEach(option => option.remove());

    //adds the new filter
    values.forEach(value =>{
        const option = document.createElement('option');
        option.textContent = value;
        element.appendChild(option);
    })
}

//job class
class Job{
    //constructor for the job class
    constructor(Title,Type,Level,Skill,Description,Posted){
        this.title = Title;
        this.type = Type;
        this.level = Level;
        this.skill = Skill;
        this.description = Description;
        this.time = this.convertTime(Posted);//holds the formated time in minutes
        this.posted = Posted;//holds the time posted
    }
    //the display function creates a list element from the job
    display() {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${this.title} - ${this.type} (${this.level})`;
        listItem.onclick = () => {
            this.showModal();
        }
        return listItem;
    }

    //displays the modal with info about the job
    showModal() {
        //gets the elements
        const modal = document.getElementById('jobModal');
        const title = document.getElementById('title');
        const info = document.getElementById('jobInfo');
        modal.style.display = 'flex';//displays the modal



        title.textContent = this.title;
        info.innerHTML = `
        <p><strong>Type:</strong> ${this.type}</p>
        <p><strong>Level:</strong> ${this.level}</p>
        <p><strong>Skill:</strong> ${this.skill}</p>
        <p><strong>Description:</strong> ${this.description}</p>
        <p><strong>Posted:</strong> ${this.posted}</p>`

        document.getElementById('closeModal').onclick = function () {
            modal.style.display = 'none';
        };

        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    }

    //converts time to minutes
    convertTime(time){
        const parts = time.toLowerCase().split(" ");
        if(parts[1].includes("minute")){
            return +parts[0];
        }else if(parts[1].includes("hour")){
            return +parts[0]*60;
        }else{
            return Infinity;
        }
    }
}