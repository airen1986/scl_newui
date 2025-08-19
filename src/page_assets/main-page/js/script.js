import { postData,get_cl_element,confirmBox,executeQuery, fetchData, uploadFile,executePython,executeJavascript,executeR,addDefaultModel,fetchSchema } from "../../../assets/js/scc"
import {uploadExcel,downloadExcel,get_uploadExcel_info} from "../../../core/gridMethods"
const scc_one_modal = document.getElementById("scc-one-modal")

let selected = []
let excelUploadInfo = {}
let selectedFile = null
let imgBlob = null
const current_version = "1.0.0"
const params = new URLSearchParams(window.location.search)
let schema = {}
const modelUID = params.get('modelUID');
const icons_class = {'DB_Icon': 'fas fa-database'}
let tsk_id

// Mobile menu toggle
document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

// Model dropdown toggle
document.getElementById('models-menu-button').addEventListener('click', function() {
    const dropdown = document.getElementById('dashboard-dropdown');
    dropdown.classList.toggle('hidden');
});

// Files dropdown toggle
document.getElementById('files-menu-button').addEventListener('click', function() {
    const dropdown = document.getElementById('files-dropdown');
    dropdown.classList.toggle('hidden');
});

// RUN dropdown toggle
document.getElementById('run-menu-button').addEventListener('click', function() {
    const dropdown = document.getElementById('runs-dropdown');
    dropdown.classList.toggle('hidden');
});

// Mobile Dashboard dropdown toggle
document.getElementById('mobile-dashboard-button').addEventListener('click', function() {
    const dropdown = document.getElementById('mobile-dashboard-dropdown');
    dropdown.classList.toggle('hidden');
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const dashboardButton = document.getElementById('models-menu-button');
    const dashboardDropdown = document.getElementById('dashboard-dropdown');
    const filesButton = document.getElementById('files-menu-button');
    const filesDropdown = document.getElementById('files-dropdown');
    const runsButton = document.getElementById('run-menu-button');
    const runsDropdown = document.getElementById('runs-dropdown');
    const mobileDashboardButton = document.getElementById('mobile-dashboard-button');
    const mobileDashboardDropdown = document.getElementById('mobile-dashboard-dropdown');

    // Close desktop dropdown if clicked outside
    if (!dashboardButton.contains(event.target) && !dashboardDropdown.contains(event.target)) {
        dashboardDropdown.classList.add('hidden');
    }

    // Close files dropdown if clicked outside
    if (!filesButton.contains(event.target) && !filesDropdown.contains(event.target)) {
        filesDropdown.classList.add('hidden');
    }

    // Close files dropdown if clicked outside
    if (!runsButton.contains(event.target) && !runsDropdown.contains(event.target)) {
        runsDropdown.classList.add('hidden');
    }

    // Close mobile dropdown if clicked outside
    if (!mobileDashboardButton.contains(event.target) && !mobileDashboardDropdown.contains(event.target)) {
        mobileDashboardDropdown.classList.add('hidden');
    }
});

document.addEventListener("DOMContentLoaded", async function() {
    
    schema = await fetchSchema()
    
    // Initialize the SQLite3 module
    let result = await executeQuery('init')

    if (!result || result.msg != 'Success'){
        confirmBox('Alert!','Some error occured while initializing sqlite.')
        return
    }
    
    if (modelUID){
        await postData('/home/get-attached-model',{modelId:`${modelUID}`})
        const url = window.location.origin + window.location.pathname;
        history.replaceState(null, '', url);        
    }

    setTimeout(get_user_models, 400);

    const shareBtn = document.getElementById('shareBtn');
    shareBtn.classList.add('blink');
    
   
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach(modalElement => {
        if (!bootstrap.Modal.getInstance(modalElement)) {
        new bootstrap.Modal(modalElement);
        }
    });
    
    

    // document.getElementById("modal-createView").addEventListener('hide.bs.modal',function(){
    //     document.getElementById("viewName").value = ""
    //     document.getElementById("query-input").value = ""
    // })

    document.getElementById("editorBtn").onclick = async function(){
        const selected_model = document.getElementById("availableModal").querySelector("li.selectedValue").innerText
        if (!selected_model){
            confirmBox("Alert!","Please select a model")
            return
        }    
        window.open(`./sqlEditor.html?tableName=V_TEMPV&modelName=${selected_model}`);
    }

    document.getElementById('availInpFiles').onclick = function(){
        document.getElementById('modal-input-files').querySelector('h2').innerText = 'Input Files'
        populateInputFiles()
    } 
    
    document.getElementById('availOutFiles').onclick = function(){
        document.getElementById('modal-input-files').querySelector('h2').innerText = 'Output Files'
        populateOutputFiles()
    } 

    
    document.getElementById("shareBtn").onclick = function(){
        const selected_model = document.getElementById("availableModal").querySelector("li.selectedValue")
        if (!selected_model){
            confirmBox("Alert!","Please select a model")
            return
        }
        const modelName = selected_model.innerText
        const projectName = selected_model.getAttribute('project')
        window.open(`./editorPage.html?projectName=${projectName}&modelName=${modelName}`);
    }


    // document.getElementById("closeOutput").onclick = function(){
    //     document.getElementById('outputDiv').style.display = "none"     
    // }

    // const modelButtons = document.querySelectorAll('#modelList button');
    
    // modelButtons.forEach(button => {
    //     button.addEventListener('click', function() {
    //         // Remove selected state from all buttons
    //         modelButtons.forEach(btn => {
    //             btn.className = 'deselected-button';
    //         });
            
    //         // Add selected state to clicked button
    //         this.className = 'selected-button';
    //     });
    // });

    // document.getElementById("ok-view").onclick = create_view;
    // document.getElementById("deleteModel").onclick = remove_modal.bind(null,true)
    // document.getElementById("removeModel").onclick = remove_modal.bind(null,false)
    document.getElementById("addNew").onclick = get_newModel_modal.bind(null,"Add New Model",false)
    // document.getElementById('downloadAllFiles').onclick = fetchFilesAndDownloadZip
    // document.getElementById("addExisting").onclick = addExistingModel
    // document.getElementById("saveAs").onclick = saveAsModel
    // document.getElementById("uploadModel").onclick = uplaodModel
    // document.getElementById("downloadModel").onclick = downloadModel
    // document.getElementById("uploadExcel").onclick = uploadExcelFile
    // document.getElementById("downloadExcel").onclick = downloadExcelFile
    // document.getElementById("vacuum").onclick = vacuumModel
    // document.getElementById('saveFiles').onclick = saveFiles
    // document.getElementById("uploadPackage").onclick = uploadPackage
    // document.getElementById('downloadOutput').onclick = downloadOutput

    await executePython('init','editor')
    shareBtn.classList.remove('blink');
});

// Model selection functionality
// document.addEventListener('DOMContentLoaded', async function() {
//     const modelButtons = document.querySelectorAll('#modelList button');
    
//     modelButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             // Remove selected state from all buttons
//             modelButtons.forEach(btn => {
//                 btn.className = 'deselected-button';
//             });
            
//             // Add selected state to clicked button
//             this.className = 'selected-button';
//         });
//     });

//     document.getElementById("addNew").onclick = get_newModel_modal.bind(null,"Add New Model",false)
// });

// Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const svg = this.querySelector('svg');
            
            // Toggle current
            content.classList.toggle('hidden');
            
            // Rotate the + icon to form an × (45 degrees)
            if (content.classList.contains('hidden')) {
                svg.style.transform = 'rotate(0deg)';
            } else {
                svg.style.transform = 'rotate(45deg)';
            }
        });
    });
});

// document.getElementById('addNew').onclick = function() {
//     scc_one_modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
//     scc_one_modal.classList.add('flex');
// }

// document.getElementById('closeModal').onclick = function () {
//     scc_one_modal.classList.remove('flex');
//     scc_one_modal.classList.add('hidden');
// }

// // Optional: close when clicking outside modal box
// scc_one_modal.addEventListener('click', (e) => {
//     if (e.target === scc_one_modal){
//         scc_one_modal.classList.remove('flex');
//         scc_one_modal.classList.add('hidden');  
//     }
// });

const modalCloseBtn = document.getElementById("modal-close")

// Modal toggle
function showModal() {
  scc_one_modal.classList.remove("hidden", "opacity-0")
  scc_one_modal.classList.add("flex")
}
function hideModal() {
  scc_one_modal.classList.add("hidden")
  scc_one_modal.classList.remove("flex")
}

modalCloseBtn.addEventListener("click", hideModal)

function populate_modal(header_name, btn_text) {
  const modal_header = scc_one_modal.querySelector('.flex h2')
  modal_header.innerText = header_name

  const modal_body = scc_one_modal.querySelector(".modal-body")
  modal_body.innerHTML = ""

  const modal_footer = scc_one_modal.querySelector(".modal-footer")
  modal_footer.innerHTML = ""

  // Cancel Button
  const cancel_button = get_cl_element("button",
    "px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer",
    null,
    document.createTextNode("Cancel"))
  cancel_button.onclick = hideModal

  // Add Button
  const add_btn = get_cl_element("button",
    "px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-950 ml-auto cursor-pointer",
    null,
    document.createTextNode(btn_text))

  modal_footer.appendChild(cancel_button)
  modal_footer.appendChild(add_btn)

  return [modal_body, add_btn]
}


function get_newModel_modal(header, anotherModal = false) {
  const [modal_body, add_btn] = populate_modal(header, "Add")
  const form_div = get_cl_element("div", "space-y-4")

  form_div.appendChild(
    get_addModel_row('name_div', 'Model Name', 'db_name', 'normal', [], '', "fas fa-database")
  )

  if (anotherModal) {
    form_div.appendChild(
      get_addModel_row('path_div', 'Model Path', 'db_path', 'normal')
    )
  } else {
    form_div.appendChild(
      get_addModel_row('template_div', 'Model Template', 'model_template', 'select', Object.keys(schema))
    )
  }

  modal_body.appendChild(form_div)

  add_btn.onclick = async function () {
    const model_name = document.getElementById('db_name').value
    if (model_name.trim() == "" || !valid_string(model_name)) {
      confirmBox("","Please enter valid model name")
      return
    }

    for (let cn of document.getElementById("availableModal").querySelectorAll("li")) {
      if (model_name.trim() == cn.innerText) {
        confirmBox("",`Model already active with same name ${model_name}`)
        return
      }
    }

    let template_el = document.getElementById('model_template')
    let model_template = 'Sample DB'

    if (template_el) {
      model_template = template_el.value
    }

    let project_name = 'Default'

    hideModal() // close modal
    
    let data = {
      model_name: model_name,
      model_template: model_template,
      project_name: project_name,
      schemas: schema,
      db_user: '',
      password: '',
      host: '',
      port: 0,
      db_type: 'SQLITE'
    }

    const res = await fetchData('home', 'addNewModel', data)

    if (res.msg === 'Success') {
      let model_body = document.getElementById("availableModal")
      model_body.appendChild(get_li_element([model_name, model_template, project_name, 'SQLITE']))
      model_body.lastChild.click()
      confirmBox("Success!", "New Model added")
    } else {
      confirmBox("Alert!", res.msg)
    }
  }

  showModal()
}

function valid_string(string) {
    var pattern = /^[a-zA-Z0-9_]+$/;
    return pattern.test(string);
}

function get_addModel_row(div_id, label_text, id, input_type, options = [], placeholder_text = '', icon_class = '', input_typ = 'text') {
    let inputDiv;

    // Main wrapper (row)
    const main_div = get_cl_element(
        "div",
        "flex flex-col sm:flex-row items-center mb-4",
        div_id
    );

    // Label
    let label = get_cl_element(
        "div",
        "w-full sm:w-1/3 px-2",
        null,
        get_cl_element("label", "block text-gray-700 text-sm font-medium my-2", null, document.createTextNode(label_text))
    );

    // Input container
    inputDiv = get_cl_element("div", "w-full sm:w-2/3 px-2");

    if (input_type === 'select') {
        const input_el = get_cl_element("select", "block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500", id);

        if (options.includes('Default') || options.length === 0) {
            input_el.appendChild(get_cl_element("option", null, null, document.createTextNode('Default')));
        }

        for (let mtype of options) {
            if (mtype !== 'Default') {
                let opt = get_cl_element("option", null, null, document.createTextNode(mtype));
                input_el.appendChild(opt);
            }
        }

        if (input_el.firstChild) {
            input_el.firstChild.setAttribute("selected", "");
            inputDiv.appendChild(input_el);
        }
    } else {
        const input_group = get_cl_element("div", "relative flex items-center");
        const input_el = get_cl_element("input", "w-full rounded-lg border border-gray-300 p-2 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500", id);
        input_el.setAttribute("type", input_typ);
        input_el.setAttribute("placeholder", placeholder_text);

        input_group.appendChild(input_el);

        if (icon_class.trim() !== '') {
            // icon on right side
            const iconWrapper = get_cl_element("span", "absolute right-2 text-gray-400 pointer-events-none", null,
                get_cl_element("span", icon_class)
            );
            input_group.appendChild(iconWrapper);
        }

        inputDiv.appendChild(input_group);
    }

    main_div.appendChild(label);
    main_div.appendChild(inputDiv);

    return main_div;
}

function get_li_element(model_name) {
    let el = get_cl_element("li", "list-none m-0", null, null);
    
    let el_child = get_cl_element("a", "block p-2 rounded-none cursor-pointer hover:bg-gray-100");
    
    el_child.appendChild(get_cl_element("span", "block text-left", null, null));
    
    el_child.firstChild.appendChild(get_cl_element("span", `${icons_class['DB_Icon']} pr-2`));
    el_child.firstChild.appendChild(document.createTextNode(model_name[0]));
    
    el.appendChild(el_child);
    
    el.setAttribute("project", model_name[2]);
    el.setAttribute("template", model_name[1]);
    el.setAttribute("dbtype", model_name[3]);

    el.onclick = async function (e) {
        let proj_name = el.getAttribute('project');
        document.getElementById('outputTxt').innerHTML = "";
        
        if (!this.classList.contains("selectedValue")) {
            // UPGRADE VERSION
            let version = await fetchData('home','getVersion',{ model_name: this.innerText })
            if (version !== current_version){
                await fetchData('home','upgradeVersion',{ modelName: this.innerText,db_version:version,current_version: current_version})
            }
            
            for (let cn of this.parentNode.querySelectorAll("li.selectedValue")) {
                cn.classList.remove("selectedValue");
            }
            
            get_model_tables(this.innerText, model_name[1]);

            this.classList.add("selectedValue");
            e.preventDefault();
        }

        // Add TaskType column if not exists
        const db_name = this.innerText;
        const column_info = await executeQuery('fetchData', db_name, "PRAGMA table_info(S_TaskMaster)");
        const column_names = column_info.map(col => col[1]);
        
        if (!column_names.includes("TaskType")) {
            await executeQuery('executeQuery', db_name, 
                "ALTER TABLE S_TaskMaster ADD COLUMN TaskType VARCHAR DEFAULT 'PythonScript'"
            );
        }

        // Create required tables if not exists
        await executeQuery('executeQuery', db_name, `
            CREATE TABLE IF NOT EXISTS S_Notebooks (
                NotebookId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                Name VARCHAR,
                Type VARCHAR,
                Status VARCHAR DEFAULT 'Active',
                CreationDate VARCHAR DEFAULT (datetime('now','localtime')),
                LastUpdateDate VARCHAR DEFAULT (datetime('now','localtime'))
            )
        `);

        await executeQuery('executeQuery', db_name, `
            CREATE TABLE IF NOT EXISTS S_NotebookContent (
                CellId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                Name VARCHAR,
                NotebookId INTEGER NOT NULL,    
                CellContent VARCHAR,
                CellType VARCHAR,
                CreationDate VARCHAR DEFAULT (datetime('now','localtime')),
                LastUpdateDate VARCHAR DEFAULT (datetime('now','localtime'))
            )
        `);

        await executeQuery('executeQuery', db_name, `
            CREATE TABLE IF NOT EXISTS S_Queries (
                QueryId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                Name VARCHAR UNIQUE,
                TableName VARCHAR,
                ShowSummary INTEGER NOT NULL,
                HideNullRows INTEGER NOT NULL,
                Levels VARCHAR DEFAULT '[]',
                Series VARCHAR DEFAULT '[]',
                SeriesProperties VARCHAR DEFAULT '{}',
                Layout VARCHAR DEFAULT '{}',
                GraphType VARCHAR,
                WorksheetProperties VARCHAR DEFAULT '{}',
                LevelsProperties VARCHAR DEFAULT '{}',
                CreationDate VARCHAR DEFAULT (datetime('now','localtime')),
                LastUpdateDate VARCHAR DEFAULT (datetime('now','localtime'))
            )
        `);

        // await populateExecutableFiles(this.innerText);
    }
    return el;
}

async function get_model_tables(model_name,template) {
    document.getElementById("tableGroup").innerHTML = ""    
    const data = await fetchData('home','fetchTableGroups',{ model_name: model_name })

    for (let group_name in data) {
        document.getElementById("tableGroup").appendChild(get_accordian(group_name, data[group_name]))
    }    
}

async function get_user_models() {
    document.getElementById("tableGroup").innerHTML = ""
    let all_models = await fetchData('home','getUserModels')
    if (all_models.length == 0){
        let model = await addDefaultModel(schema)
        if ((model).length > 0){
            all_models.push(model)
        }
    }
    populate_models(all_models)
    return all_models
}

function populate_models(model_names) {
    let model_body = document.getElementById("availableModal")
    model_body.innerHTML = ""
    for (let model_name of model_names) {
        model_body.appendChild(get_li_element(model_name))
    }

    if (modelUID && model_body.lastChild){
        model_body.lastChild.click()
    }else if ( model_body.firstChild){
        model_body.firstChild.click()
    }
}

function get_accordian(group_name, table_list) {
    let accordian_id = group_name.replace(/\s/g, "_")

    // Accordion wrapper
    let card_border = get_cl_element("div", "border border-border rounded mb-2", null,
        get_cl_element("button", "w-full flex justify-between items-center pl-6 pr-3 py-4 bg-transparent focus:outline-none accordion-header", accordian_id + '_head',
            get_cl_element("span", "font-medium text-card-foreground", null, document.createTextNode(group_name))
        )
    )

    // Add toggle icon
    let span = get_cl_element("span", "fa-solid fa-plus transition-transform duration-200")
    card_border.querySelector("button").appendChild(span)

    // Accordion content
    let card_body = get_cl_element("div", "accordion-content hidden px-4 pb-3", accordian_id,
        get_cl_element("div", "", null, null)
    )

    // Add each table as a clickable div
    for (let table_name of table_list) {
        let el = get_cl_element("div", "p-3 border-b hover:bg-muted cursor-pointer", null,
            document.createTextNode(table_name[1])
        )

        el.onclick = function () {
            const selected_model = document.getElementById("availableModal").querySelector("li.selectedValue")
            window.open(`./tableDisplay.html?tableName=${table_name[0]}&modelName=${selected_model.innerText}`);
        }
        el.setAttribute("tableName", table_name[0])

        card_body.firstChild.appendChild(el)
    }

    card_border.appendChild(card_body)

    // Add click event for accordion toggle
    card_border.querySelector("button").addEventListener("click", function () {
        let target_id = this.getAttribute("id").replace("_head", "")
        let content = document.getElementById(target_id)

        // Close all other accordions
        document.querySelectorAll(".accordion-content").forEach(el => {
            if (el.id !== target_id) {
                el.classList.add("hidden")
                el.previousSibling.querySelector("span.fa-solid").classList.remove("rotate-45")
            }
        })

        // Toggle current accordion
        content.classList.toggle("hidden")
        this.querySelector("span.fa-solid").classList.toggle("rotate-45") // rotate icon for open
    })

    return card_border
}
