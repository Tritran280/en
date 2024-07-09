class DataTree {
	constructor() {
		this.data = [];
	}

	async getData() {
		const response = await fetch('data/ordered_list.json');
		const data = await response.json();
		this.data = data;
		return data;
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
		
		const aMain = document.createElement('a');
		aMain.href = '#';
		aMain.textContent = key;
		
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
		
		liTheory.appendChild(spanTheory);
		liTheory.appendChild(aTheory);
		
		olMain.appendChild(liTheory);
	
		Object.entries(value.ordered_list).forEach(([listKey, listValue]) => {
			const liSub = document.createElement('li');
			
			const spanSub = document.createElement('span');
			spanSub.className = 'num';
			spanSub.textContent = `${value.id}.${listKey}`;
			
			const aSub = document.createElement('a');
			aSub.href = '#';
			aSub.textContent = listValue;
			
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