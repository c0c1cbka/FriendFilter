VK.init({
	apiId: 6682012
});

function auth() {
	return new Promise((resolve, reject) => {
		VK.Auth.login(data => {
			if (data.session) {
				resolve();
			} else {
				reject();
			}
		}, 2);
	});
}

function callApi(method, params) {
	params.v = '5.76';

	return new Promise((resolve, reject) => {
		VK.api(method, params, (data) => {
			if (data.error) {
				reject(data.error);
			} else {
				resolve(data.response);
			}
		});
	});
}

function inserFriends(friends_json, id_el, num_tem) {
	let render;
	let html;

	if (num_tem === 1) {
		render = Handlebars.compile(document.querySelector('#template_1').textContent);
	}
	if (num_tem === 2) {
		render = Handlebars.compile(document.querySelector('#template_2').textContent);
	}

	html = render(friends_json);

	result = document.querySelector(id_el);
	result.innerHTML = '';
	result.innerHTML = html;
}

function getElFromJson(id, json) {
	for (let i of json) {
		if (i.id == id) {
			return i;
		}
	}
}

function deleteElFromJson(id, json) {
	for (let i of json) {
		if (i.id == id) {
			json.splice(json.indexOf(i), 1);
			return;
		}
	}
}


function findEl(where_json, what_el) {
	for (let i of where_json) {
		if (i.id === what_el.id) {
			return true;
		}
	}
	return false;
}

document.querySelector('#filtr_1').addEventListener('keyup', function() {
	let temp_json = [];

	for (let i of load_json) {
		if (i.first_name.toUpperCase().indexOf(this.value.toUpperCase()) != -1 || i.last_name.toUpperCase().indexOf(this.value.toUpperCase()) != -1) {
			temp_json.push(i);
		}
	}
	inserFriends(temp_json, '#friends_1', 1);
});

document.querySelector('#filtr_2').addEventListener('keyup', function() {
	let temp_json = [];

	for (let i of friends2_json) {
		if (i.first_name.toUpperCase().indexOf(this.value.toUpperCase()) != -1 || i.last_name.toUpperCase().indexOf(this.value.toUpperCase()) != -1) {
			temp_json.push(i);
		}
	}
	inserFriends(temp_json, '#friends_2', 2);
});

document.querySelector('#save_btn').addEventListener('click', function() {
	localStorage.data = JSON.stringify(friends2_json);
	alert('я сохранил');
});

function clickEl(elem) {
	elem.addEventListener('click', (e) => {
		let target = e.target;

		if (target.closest('.btn-vk-plus')) {
			let temp_el = getElFromJson(target.closest('.btn-vk-plus').getAttribute('data-id'), load_json);

			friends2_json.push(temp_el);
			inserFriends(friends2_json, '#friends_2', 2);

			deleteElFromJson(temp_el.id, load_json);
			inserFriends(load_json, '#friends_1', 1);
		}

		if (target.closest('.btn-vk-minus')) {
			let temp_el = getElFromJson(target.closest('.btn-vk-minus').getAttribute('data-id'), friends2_json);

			load_json.push(temp_el);
			inserFriends(load_json, '#friends_1', 1);

			deleteElFromJson(temp_el.id, friends2_json);
			inserFriends(friends2_json, '#friends_2', 2);
		}
	});


	elem.addEventListener('dragstart', (e) => {
		currentDrag = {
			source: elem,
			node: e.target
		};
	});

	elem.addEventListener('dragover', (e) => {
		e.preventDefault();
	});

	elem.addEventListener('drop', (e) => {
		if (currentDrag) {
			e.preventDefault();
			console.log(currentDrag.node);
			if (currentDrag.source !== elem) {
				if (elem.closest('#friends_1')) { //minus
					let temp_el = getElFromJson(currentDrag.node.querySelector('.btn-vk-minus').getAttribute('data-id'), friends2_json);

					load_json.push(temp_el);
					inserFriends(load_json, '#friends_1', 1);

					deleteElFromJson(temp_el.id, friends2_json);
					inserFriends(friends2_json, '#friends_2', 2);
				}
				if (elem.closest('#friends_2')) { //plus
					let temp_el = getElFromJson(currentDrag.node.querySelector('.btn-vk-plus').getAttribute('data-id'), load_json);

					friends2_json.push(temp_el);
					inserFriends(friends2_json, '#friends_2', 2);

					deleteElFromJson(temp_el.id, load_json);
					inserFriends(load_json, '#friends_1', 1);
				}
			}

			currentDrag = null;
		}
	});
}

let load_json = [];
let friends2_json = [];
let currentDrag;

auth().then(() => {
	return callApi('friends.get', {
		fields: 'photo_100'
	});
}).then((friends) => {
	if (localStorage.data) {
		friends2_json = JSON.parse(localStorage.data);
		inserFriends(friends2_json, '#friends_2', 2);
	}


	for (let i of friends.items) {
		if (!findEl(friends2_json, i)) {
			load_json.push(i);
		}
	}
	inserFriends(load_json, '#friends_1', 1);

	clickEl(document.querySelector('#friends_1'));
	clickEl(document.querySelector('#friends_2'));
});