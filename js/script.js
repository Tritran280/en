
class DataTree {
    constructor() {
        this.data = [];	// dữ liệu cây
		
		this.menuState = 0; // trạng thái của menu 0: đóng, 1: mở

        this.keywords = []; // keywords dùng để tìm kiếm

        this.listkeywords = []; // list keywords dùng để tìm kiếm
    }

    async getData() {
        const response = await fetch('https://github.com/Tritran280/en/blob/main/data/ordered_list.json');
        const data = await response.json();
        this.data = data;
        return data;
    }

    async getlistKeywords() {
        for (let i = 0; i < 3; i++) {
            const response = await fetch(`https://github.com/Tritran280/en/blob/main/data//data/keywords/op_${i}.json`);
            const data = await response.json();
            this.listkeywords = this.listkeywords.concat(data);
        }
    }


}

const dataTree = new DataTree();

dataTree.getData().then(data => {
    const treeStructure = document.getElementById('tree-structure');

    Object.entries(data).forEach(([key, value]) => {
        const li = document.createElement('li');

        const spanNum = document.createElement('span');
        spanNum.className = 'num';
        spanNum.textContent = value.id;
        wrapWordsInSpans(spanNum);

        const aMain = document.createElement('a');
        aMain.href = '#';
        aMain.textContent = key;
        aMain.addEventListener('click', (event) => event.preventDefault()); // Prevent default behavior
        wrapWordsInSpans(aMain);

        const olMain = document.createElement('ol');
        olMain.className = 'ordered-list';

        const liTheory = document.createElement('li');

        const spanTheory = document.createElement('span');
        spanTheory.className = 'num';
        spanTheory.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';

        const aTheory = document.createElement('a');
        aTheory.href = value.thery.adress;
        aTheory.className = 'theory';
        aTheory.textContent = value.thery.title;
        wrapWordsInSpans(aTheory);

        liTheory.appendChild(spanTheory);
        liTheory.appendChild(aTheory);

        olMain.appendChild(liTheory);

        Object.entries(value.ordered_list).forEach(([listKey, listValue]) => {
            const liSub = document.createElement('li');

            const spanSub = document.createElement('span');
            spanSub.className = 'num';
            spanSub.textContent = `${listKey}`;
            wrapWordsInSpans(spanSub);
            // lắng nghe khi click vào spanSub trả về giá trị của spanSub
            
            spanSub.addEventListener('click', () => {
                goToPage(spanSub.textContent);
            });

            const aSub = document.createElement('a');
            aSub.href = '#';
            aSub.textContent = listValue;
            aSub.addEventListener('click', (event) => event.preventDefault()); // Prevent default behavior
            wrapWordsInSpans(aSub);

            liSub.appendChild(spanSub);
            liSub.appendChild(aSub);

            olMain.appendChild(liSub);
        });

        li.appendChild(spanNum);
        li.appendChild(aMain);
        li.appendChild(olMain);

        treeStructure.appendChild(li);
    });
}).catch(error => {
    console.error('Error fetching data:', error);
});

// đi đến trang mông muốn
function goToPage(page) {
    // lưu giá trị vào local storage
    localStorage.setItem('cookie', page);
    // chuyển trang
    window.location.href = '/template/show.html';
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
    console.log("dữ liệu đã được lấy từ file json");
}
);


function clearSearch() {
    document.getElementById('search').value = '';
    document.getElementById('search').focus();
    filterSuggestions();
}
