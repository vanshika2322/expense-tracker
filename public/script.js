const API = "/expenses";

let chart;
let editExpenseId = null;

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN");
}

function setTodayDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
}

async function fetchExpenses() {
  try {
    const res = await fetch(API);
    const expenses = await res.json();

    const selectedCategory = document.getElementById("filterCategory").value;
    const filteredExpenses =
      selectedCategory === "All"
        ? expenses
        : expenses.filter((expense) => expense.category === selectedCategory);

    renderExpenses(filteredExpenses);
    renderSummary(filteredExpenses);
    renderChart(filteredExpenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
}

function renderExpenses(expenses) {
  const expenseList = document.getElementById("expenseList");
  const emptyState = document.getElementById("emptyState");

  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  expenses.forEach((expense) => {
    const item = document.createElement("div");
    item.className = "expense-item";

    item.innerHTML = `
      <div class="expense-left">
        <h3>${expense.title}</h3>
        <div class="expense-meta">
          <span class="category-badge ${expense.category.toLowerCase()}">${expense.category}</span>
          <span>${formatDate(expense.date)}</span>
        </div>
      </div>

      <div class="expense-right">
        <div class="expense-amount">₹${expense.amount}</div>
        <div class="action-buttons">
          <button class="edit-btn" onclick="editExpense('${expense._id}', '${expense.title}', ${expense.amount}, '${expense.category}', '${new Date(expense.date).toISOString().split("T")[0]}')">Edit</button>
          <button class="delete-btn" onclick="deleteExpense('${expense._id}')">Delete</button>
        </div>
      </div>
    `;

    expenseList.appendChild(item);
  });
}

function renderSummary(expenses) {
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  document.getElementById("totalAmount").innerText = totalAmount;
  document.getElementById("totalEntries").innerText = expenses.length;
}

function renderChart(expenses) {
  const categoryTotals = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Bills: 0,
    Health: 0,
    Other: 0
  };

  expenses.forEach((expense) => {
    categoryTotals[expense.category] += Number(expense.amount);
  });

  const ctx = document.getElementById("expenseChart");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#ef4444",
            "#3b82f6",
            "#f59e0b",
            "#8b5cf6",
            "#10b981",
            "#6b7280"
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

async function saveExpense() {
  const title = document.getElementById("title").value.trim();
  const amount = document.getElementById("amount").value.trim();
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (!title || !amount || !category || !date) {
    alert("Please fill all fields.");
    return;
  }

  const expenseData = {
    title,
    amount,
    category,
    date
  };

  try {
    if (editExpenseId) {
      await fetch(`${API}/${editExpenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(expenseData)
      });
    } else {
      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(expenseData)
      });
    }

    resetForm();
    fetchExpenses();
  } catch (error) {
    console.error("Error saving expense:", error);
  }
}

function editExpense(id, title, amount, category, date) {
  editExpenseId = id;

  document.getElementById("title").value = title;
  document.getElementById("amount").value = amount;
  document.getElementById("category").value = category;
  document.getElementById("date").value = date;

  document.getElementById("formHeading").innerText = "Edit Expense";
  document.getElementById("addBtn").innerText = "Update Expense";
  document.getElementById("cancelBtn").classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  editExpenseId = null;

  document.getElementById("title").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "Food";
  setTodayDate();

  document.getElementById("formHeading").innerText = "Add Expense";
  document.getElementById("addBtn").innerText = "Add Expense";
  document.getElementById("cancelBtn").classList.add("hidden");
}

async function deleteExpense(id) {
  const confirmDelete = confirm("Are you sure you want to delete this expense?");
  if (!confirmDelete) return;

  try {
    await fetch(`${API}/${id}`, {
      method: "DELETE"
    });
    fetchExpenses();
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
}

setTodayDate();
fetchExpenses();