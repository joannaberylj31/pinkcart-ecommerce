const API_URL = "http://localhost:5000";

let products = [];
let cart = JSON.parse(localStorage.getItem("pinkcart")) || [];

let currentUser =
    JSON.parse(localStorage.getItem("pinkcartUser")) || null;

let isRegister = false;


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    try {

        const response =
            await fetch(`${API_URL}/api/products`);

        products = await response.json();

        displayProducts();

    } catch (error) {

        document.getElementById("productContainer").innerHTML =
            "<p>Could not connect to server 💔</p>";

    }
}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts() {

    const container =
        document.getElementById("productContainer");

    container.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <div class="product-info">

                <h3>${product.name}</h3>

                <p>
                    ${product.description}
                </p>

                <div class="price">
                    ₹${product.price}
                </div>

                <button
                    class="add-button"
                    onclick="addToCart(${product.id})">

                    Add to Cart 🛒

                </button>

            </div>
        `;

        container.appendChild(card);
    });
}


// ========================================
// ADD TO CART
// ========================================

function addToCart(productId) {

    const product =
        products.find(p => p.id === productId);

    if (!product) return;

    const existing =
        cart.find(item => item.id === productId);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1
        });
    }

    saveCart();

    updateCartCount();

    alert(`${product.name} added to cart 💗`);
}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem(
        "pinkcart",
        JSON.stringify(cart)
    );
}


// ========================================
// CART COUNT
// ========================================

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    document.getElementById("cartCount").textContent =
        count;
}


// ========================================
// SHOW CART
// ========================================

function showCart() {

    const modal =
        document.getElementById("cartModal");

    modal.style.display = "flex";

    displayCart();
}


// ========================================
// CLOSE CART
// ========================================

function closeCart() {

    document.getElementById("cartModal")
        .style.display = "none";
}


// ========================================
// DISPLAY CART
// ========================================

function displayCart() {

    const container =
        document.getElementById("cartItems");

    const totalElement =
        document.getElementById("cartTotal");

    container.innerHTML = "";

    if (cart.length === 0) {

        container.innerHTML =
            "<p>Your cart is empty 🛒</p>";

        totalElement.textContent = "0";

        return;
    }

    let total = 0;

    cart.forEach((item, index) => {

        total +=
            item.price * item.quantity;

        const div =
            document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `

            <div>

                <h4>${item.name}</h4>

                <p>
                    ₹${item.price}
                    × ${item.quantity}
                </p>

            </div>

            <button
                class="remove-button"
                onclick="removeFromCart(${index})">

                Remove

            </button>
        `;

        container.appendChild(div);
    });

    totalElement.textContent =
        total.toFixed(2);
}


// ========================================
// REMOVE FROM CART
// ========================================

function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

    updateCartCount();

    displayCart();
}


// ========================================
// LOGIN MODAL
// ========================================

function showLogin() {

    document.getElementById("loginModal")
        .style.display = "flex";
}


function closeLogin() {

    document.getElementById("loginModal")
        .style.display = "none";
}


// ========================================
// TOGGLE LOGIN / REGISTER
// ========================================

function toggleAuth() {

    isRegister = !isRegister;

    const title =
        document.getElementById("authTitle");

    const name =
        document.getElementById("authName");

    const button =
        document.getElementById("authButton");

    const switchText =
        document.getElementById("switchText");

    if (isRegister) {

        title.textContent =
            "Create Account 💗";

        name.style.display =
            "block";

        button.textContent =
            "Register";

        switchText.innerHTML =
            "Already have an account? <b>Login</b>";

    } else {

        title.textContent =
            "Welcome Back 💗";

        name.style.display =
            "none";

        button.textContent =
            "Login";

        switchText.innerHTML =
            "Don't have an account? <b>Register</b>";
    }
}


// ========================================
// LOGIN / REGISTER
// ========================================

async function submitAuth() {

    const name =
        document.getElementById("authName").value;

    const email =
        document.getElementById("authEmail").value;

    const password =
        document.getElementById("authPassword").value;

    const message =
        document.getElementById("authMessage");


    if (!email || !password ||
        (isRegister && !name)) {

        message.textContent =
            "Please fill all fields.";

        return;
    }


    try {

        let url = "";

        let body = {};

        if (isRegister) {

            url =
                `${API_URL}/api/register`;

            body = {
                name,
                email,
                password,
                role: "user"
            };

        } else {

            url =
                `${API_URL}/api/login`;

            body = {
                email,
                password
            };
        }


        const response =
            await fetch(url, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(body)
            });


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message;

            return;
        }


        if (isRegister) {

            message.textContent =
                "Registration successful! Now login 💗";

            toggleAuth();

        } else {

            currentUser = data.user;

            localStorage.setItem(
                "pinkcartUser",
                JSON.stringify(currentUser)
            );

            message.textContent =
                `Welcome ${currentUser.name}! 💗`;

            setTimeout(() => {

                closeLogin();

                loadOrders();

            }, 1000);
        }


    } catch (error) {

        message.textContent =
            "Cannot connect to server.";

    }
}


// ========================================
// CHECKOUT
// ========================================

async function checkout() {

    if (!currentUser) {

        alert(
            "Please login before checkout 💗"
        );

        closeCart();

        showLogin();

        return;
    }


    if (cart.length === 0) {

        alert(
            "Your cart is empty 🛒"
        );

        return;
    }


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    const items =
        cart.map(item => ({

            product_id: item.id,

            quantity: item.quantity,

            price: item.price
        }));


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            currentUser.id,

                        total_amount:
                            total,

                        items:
                            items
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            `Order #${data.orderId} placed successfully! 💗`
        );


        cart = [];

        saveCart();

        updateCartCount();

        closeCart();

        loadOrders();


    } catch (error) {

        alert(
            "Could not place order."
        );
    }
}


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );


    if (!currentUser) {

        container.innerHTML =
            `<p class="empty-message">
                Login to view your orders 💗
             </p>`;

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders/${currentUser.id}`
            );


        const orders =
            await response.json();


        container.innerHTML = "";


        if (orders.length === 0) {

            container.innerHTML =
                `<p class="empty-message">
                    No orders yet 🛍️
                 </p>`;

            return;
        }


        orders.forEach(order => {

            const div =
                document.createElement("div");

            div.className =
                "order-card";


            div.innerHTML = `

                <div>

                    <h3>
                        Order #${order.id}
                    </h3>

                    <p>
                        ₹${order.total_amount}
                    </p>

                    <small>
                        ${new Date(
                            order.created_at
                        ).toLocaleString()}
                    </small>

                </div>

                <span class="order-status">

                    ${order.status}

                </span>

            `;


            container.appendChild(div);

        });


    } catch (error) {

        container.innerHTML =
            "<p>Could not load orders.</p>";
    }
}


// ========================================
// INITIALIZE
// ========================================

loadProducts();

updateCartCount();

loadOrders();