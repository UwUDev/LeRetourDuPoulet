function poulet(u, p) {
    var data = "";
    if (p == null || p === "") {
        data = u
    } else {
        data = u + ":" + p
    }

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            console.log(this.responseText);
            // parse json
            const json = JSON.parse(this.responseText);

            if (json.status === "error") {
                alert(json.message);
                return;
            }

            const imgData = json.qr_data;
            const img = document.getElementById("qrCode");
            img.src = imgData;

            const name = document.getElementById("code");
            name.innerHTML = json.code;

            const pts = document.getElementById("pts");
            pts.innerHTML = json.points + "pts";

            const token = document.getElementById("token");
            token.innerHTML = json.user_id;



            document.getElementById("qrCard").style.display = "block";
            document.getElementById("details").style.display = "block";
        }
    });

    xhr.open("POST", 'https://corsproxy.io/?' + encodeURIComponent('https://pouletapi.femboy.boo/api/checkpoulet'));
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.setRequestHeader("User-Agent", navigator.userAgent);

    xhr.send(data);
}

function getKfcItems() {
    // get on https://api.kfc.fr/menu/kfcfr-generic-menu
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        let items;
        if (this.readyState === this.DONE) {
            console.log(this.responseText);
            // parse json
            const json = JSON.parse(this.responseText);
            items = [];

            console.log(" aaa " + json.categories[0])

            for (let i = 0; i < json.categories[0].categories.length; i++) {
                const category = json.categories[0].categories[i];
                for (let j = 0; j < category.products.length; j++) {
                    const product = category.products[j];
                    const name = product.dname.value;
                    const id = product.items[0].posItemId;
                    const image = "https://static.kfc.fr/images/items/xs/" + product.items[0].imageName + ".jpg";
                    const price = product.items[0].price;
                    items.push({
                        "name": name,
                        "id": id,
                        "image": image,
                        "price": price
                    });
                }
            }

            getDeasls(items)
        }
    });


    xhr.open("GET", 'https://corsproxy.io/?' + encodeURIComponent('https://api.kfc.fr/menu/kfcfr-generic-menu'));
    xhr.setRequestHeader("User-Agent", navigator.userAgent);
    xhr.send();
}

function getDeasls(items) {

    console.log(items)

    function getItemById(id) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.id === id) {
                return item;
            }
        }
        return null;
    }

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    /*TEMPLATE
    * <div class="cards">
    <div class="card-uwu gradient-card" data-tilt data-tilt-speed="1200" data-tilt-easing="cubic-bezier(.03,.98,.52,.99)">
        <img src="https://static.kfc.fr/images/items/xs/2menus10e.jpg" width="100%">
        <h2>Poulet</h2>
    </div>

    <div class="card-uwu gradient-card" data-tilt data-tilt-speed="1200" data-tilt-easing="cubic-bezier(.03,.98,.52,.99)">
        <img src="https://static.kfc.fr/images/items/xs/2menus10e.jpg" width="100%">
        <h2>Poulet</h2>
    </div>
</div>
    * */

    let cards = null;
    let count = 0;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            const json = JSON.parse(this.responseText)
            const deals = json.rewards;
            // reverse order
            deals.reverse();
            for (let i = 0; i < deals.length; i++) {
                if(cards != null) {
                    document.body.appendChild(cards);
                }

                cards = document.createElement("div");
                cards.className = "cards";
                const name = deals[i].name + " (" + deals[i].points + "pts)";
                const center = document.createElement("center");
                const h1 = document.createElement("h1");
                h1.innerHTML = name;
                center.appendChild(h1);
                document.body.appendChild(center);
                // iterate over items
                for (let j = 0; j < deals[i].items.length; j++) {
                    const dealItem = deals[i].items[j];
                    const id1 = dealItem["itemId"]["alohaItemId"]
                    const id2 = dealItem["itemId"]["amrestItemId"]
                    let item = getItemById(id1);
                    if (item == null) {
                        item = getItemById(id2);
                    }

                    if (item == null) {
                        console.log("item not found " + id1 + " " + id2)
                        continue;
                    }

                    console.log(name + " --> " + item.image)

                    var card = document.createElement("div");
                    card.className = "card-uwu gradient-card";
                    card.setAttribute("data-tilt", "");
                    card.setAttribute("data-tilt-speed", "1200");
                    card.setAttribute("data-tilt-easing", "cubic-bezier(.03,.98,.52,.99)");

                    var img = document.createElement("img");
                    img.src = item.image;

                    var h2 = document.createElement("h2");
                    h2.innerHTML = item.name;

                    card.appendChild(img);

                    card.appendChild(h2);

                    cards.appendChild(card);

                    count++;

                    console.log(count + " " + (count % 2 === 0))

                    if (count % 2 === 0) {
                        document.body.appendChild(cards);
                        cards = document.createElement("div");
                        cards.className = "cards";

                    }
                }
            }
        }

        document.body.appendChild(cards);
    });


    xhr.open("GET", 'https://corsproxy.io/?' + encodeURIComponent('https://pouletapi.femboy.boo/api/menu'));
    xhr.setRequestHeader("User-Agent", navigator.userAgent);

    xhr.send();
}

getKfcItems();

//if "d" param is set
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("d")) {
    // decode base64
    const data = atob(urlParams.get("d"));
    poulet(data, null);
}


