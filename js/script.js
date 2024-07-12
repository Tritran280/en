class DataTree {
    constructor() {
        this.data = [];  // dữ liệu cây
        this.numTasks = 61; // số lượng tasks
        this.menuState = 0; // trạng thái của menu 0: đóng, 1: mở
        this.keywords = []; // keywords dùng để tìm kiếm
        this.listkeywords = []; // list keywords dùng để tìm kiếm
        this.listTasks = []; // list tasks dùng để tìm kiếm {[id, task], [id, task], ...}
    }

    async getlistKeywords() {
        let listkeywords = [];
        let listTasks = [];
        
        const fetchData = async (i) => {
            try {
                const response = await fetch(`data/op_${i}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Failed to fetch op_${i}.json: ${error.message}`);
                return null;
            }
        };

        const tasks = [];
        for (let i = 0; i <= this.numTasks; i++) {
            tasks.push(fetchData(i));
        }

        const results = await Promise.all(tasks);
        results.forEach(data => {
            if (data) {
                listkeywords = listkeywords.concat(data);
                listTasks.push([data["GROUP"], data["NAME"], data["TASK"]]);
            }
        });

        this.listkeywords = listkeywords; // Save the keywords to the instance
        this.listTasks = listTasks; // Save the tasks to the instance
        return { listkeywords, listTasks };
    }

    async combinedFunction() {
        const { listkeywords, listTasks } = await this.getlistKeywords();
        return { listkeywords, listTasks };
    }
}

const dataTree = new DataTree();

(async () => {
    const result = await dataTree.combinedFunction();
    if (result) {

        const group = {
            "1": ["OPINION ESSAY", "https://www.google.com"],
            "2": ["ADVANTAGES OR DISADVANTAGES", "https://www.google.com"],
            "3": ["ADVANTAGES AND DISADVANTAGES", "https://www.google.com"],
            "4": ["BALANCED ARGUMENTS", "https://www.google.com"],
            "5": ["PROBLEM SOLUTION", "https://www.google.com"],
            "6": ["SPECIAL TYPES", "https://www.google.com"]
        }

        let html = '';

        Object.entries(group).forEach(([key, value]) => {
            let orderedListHTML = `
                <li> 
                    <span class="num" id="is-none"><i class="fas fa-exclamation-triangle"></i></span>
                    <a href="${value[1]}" target="_blank" class="theory">THEORY</a>
                </li>
            `;
         
            result.listTasks.forEach(task => {
                if (task[0] == key) {
                    orderedListHTML += `
                        <li>
                            <span class="num">${task[1]}</span>
                            <a href="#">${task[2]}</a>
                        </li>
                    `;
                }
            });

            html += `
                <li>
                    <span class="num" id="is-group">${key}</span>
                    <a>${value[0]}</a>
                    <ol class="ordered-list">
                        ${orderedListHTML}
                    </ol>
                </li>
            `;
        });

        const treeStructure = document.getElementById('tree-structure');
        treeStructure.innerHTML = html;

        // Attach event listeners after the HTML has been set
        treeStructure.querySelectorAll('span.num').forEach(span => {
            span.addEventListener('click', () => {
                // nếu có id = is-group và is-none thì không chuyển trang
                if (span.id !== 'is-group' && span.id !== 'is-none') {
                    goToPage(span.textContent);
                }
            });
        });

        treeStructure.querySelectorAll('a.theory').forEach(a => {
            a.addEventListener('click', event => {
                event.preventDefault();
                window.open(a.href, '_blank');
            });
        });

        treeStructure.querySelectorAll('a').forEach(a => {
            wrapWordsInSpans(a);
            if (!a.classList.contains('theory')) {
                a.addEventListener('click', event => {
                    event.preventDefault();
                });
            }
        });

    } else {
        console.error('Error fetching data');
    }
})();

// đi đến trang mông muốn
function goToPage(page) {
    localStorage.setItem('cookie', page);
    window.location.href = 'show.html';
}

function wrapWordsInSpans(element) {
    const words = element.textContent.split(' ');
    element.textContent = '';
    words.forEach(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        
        span.addEventListener('click', () => {
            if (dataTree.menuState === 1) {
                if (document.getElementById('search').value === '') {
                    document.getElementById('search').value = word.replace(".", '');
                    filterSuggestions();
                } else {
                    document.getElementById('search').value += ` ${word.replace(".", '')}`;
                    filterSuggestions();
                }

            }
        });
        element.appendChild(span);
        element.appendChild(document.createTextNode(' ')); // Add space between words
    });
}

function toggleSearch() {
    const searchInput = document.getElementById('search');
    const suggestionsList = document.getElementById('suggestions-list');

    if (dataTree.menuState === 0) {
        searchInput.classList.remove('hidden');
        searchInput.classList.add('visible');
        searchInput.focus();
        suggestionsList.style.display = 'block';
        dataTree.menuState = 1;
        document.getElementsByClassName('clear-icon')[0].style.display = 'block';
    
    } else {
        if (searchInput.value === '') {
            searchInput.classList.remove('visible');
            searchInput.classList.add('hidden');
            suggestionsList.style.display = 'none';
            dataTree.menuState = 0;
            document.getElementsByClassName('clear-icon')[0].style.display = 'none';
        } else {
            console.log('thực hiện search');
            dataTree.getlistKeywords().then(() => {
                console.log(dataTree.listkeywords);
            });
        }
    }
}

function filterSuggestions() {
    const query = document.getElementById('search').value.toLowerCase();
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';

    if (query) {
        let count = 0;
        for (let suggestion of dataTree.listkeywords) {
            let foundMatches = [];
            
            // Check if any KEYWORD matches
            for (let key in suggestion.KEYWORDS) {
                if (key.toLowerCase().includes(query) || suggestion.KEYWORDS[key].toLowerCase().includes(query)) {
                    foundMatches.push(`${key} <=> ${suggestion.KEYWORDS[key]}`);
                }
            }

            // Display up to 3 matches
            for (let i = 0; i < foundMatches.length && count < 3; i++) {
                const suggestionItem = document.createElement('div');
                suggestionItem.textContent = foundMatches[i];
                suggestionItem.onclick = function() {
                    document.getElementById('search').value = foundMatches[i];
                    suggestionsList.style.display = 'none';
                };
                suggestionsList.appendChild(suggestionItem);
                count++;
            }
        }
        suggestionsList.style.display = count > 0 ? 'block' : 'none';
    } else {
        suggestionsList.style.display = 'none';
    }
}

// tự lấy dữ liệu từ file json
dataTree.getlistKeywords().then(() => {
    // console.log("dữ liệu đã được lấy từ file json");
}
);

function clearSearch() {
    document.getElementById('search').value = '';
    document.getElementById('search').focus();
    filterSuggestions();
}