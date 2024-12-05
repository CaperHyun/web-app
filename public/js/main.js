"use strict";
let currentItemId = null;
let currentPage = 1;
const itemsPerPage = 10;
// Add debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
async function fetchItems() {
    try {
        const idInput = document.getElementById('id-input');
        const searchInput = document.getElementById('search-input');
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: itemsPerPage.toString()
        });
        if (idInput?.value) {
            params.append('id', idInput.value);
        }
        if (searchInput?.value) {
            params.append('search', searchInput.value);
        }
        if (startDateInput?.value) {
            params.append('startDate', startDateInput.value);
        }
        if (endDateInput?.value) {
            params.append('endDate', endDateInput.value);
        }
        const response = await fetch(`/api/items?${params}`);
        const data = await response.json();
        renderItems(data.items);
        renderPagination(data.pagination);
    }
    catch (error) {
        console.error('Failed to fetch items:', error);
    }
}
function renderPagination(pagination) {
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl)
        return;
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(`
      <button 
        onclick="changePage(${i})"
        class="${i === pagination.page
            ? 'bg-blue-500 text-white'
            : 'bg-white text-blue-500'} px-3 py-1 rounded">
        ${i}
      </button>
    `);
    }
    paginationEl.innerHTML = `
    <div class="flex gap-2 justify-center mt-4">
      ${pages.join('')}
    </div>
  `;
}
function changePage(page) {
    currentPage = page;
    fetchItems();
}
// Update the existing renderItems function
function renderItems(items) {
    const itemsList = document.getElementById('items-list');
    if (!itemsList)
        return;
    if (items.length === 0) {
        itemsList.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        No items found
      </div>
    `;
        return;
    }
    itemsList.innerHTML = items.map(item => `
    <div class="bg-white p-4 rounded shadow">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-lg">${item.name}</h3>
        <span class="text-sm text-gray-500">ID: ${item.id}</span>
      </div>
      <p class="text-gray-600">${item.description || ''}</p>
      <p class="text-sm text-gray-500 mt-2">
        Created: ${new Date(item.date_created).toLocaleDateString()}
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <button onclick="editItem(${item.id})"
          class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
          Edit
        </button>
        <button onclick="deleteItem(${item.id})"
          class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}
// Add search and filter controls to the HTML
function addSearchControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'mb-4 grid gap-4 md:grid-cols-4';
    controlsContainer.innerHTML = `
    <div>
      <label class="block text-sm font-medium text-gray-700">ID</label>
      <input type="number" id="id-input" 
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        placeholder="Search by ID...">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Search</label>
      <input type="text" id="search-input" 
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        placeholder="Search items...">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Start Date</label>
      <input type="date" id="start-date" 
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">End Date</label>
      <input type="date" id="end-date" 
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
    </div>
  `;
    const addButton = document.querySelector('button');
    addButton?.parentNode?.insertBefore(controlsContainer, addButton);
    // Add pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination';
    document.getElementById('items-list')?.parentNode?.appendChild(paginationContainer);
    // Add event listeners
    const searchInput = document.getElementById('search-input');
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    const idInput = document.getElementById('id-input');
    const debouncedFetch = debounce(fetchItems, 300);
    searchInput?.addEventListener('input', (e) => debouncedFetch());
    startDate?.addEventListener('change', (e) => fetchItems());
    endDate?.addEventListener('change', (e) => fetchItems());
    // Fixed ID search listener
    idInput?.addEventListener('input', (e) => {
        const input = e.target;
        if (input.value) {
            // Don't try to use params here, just call debouncedFetch
            // The params will be created in fetchItems function
            debouncedFetch();
        }
    });
}
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    addSearchControls();
    fetchItems();
});
function openModal(item) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const nameInput = document.getElementById('item-name');
    const descInput = document.getElementById('item-description');
    if (!modal || !modalTitle || !nameInput || !descInput)
        return;
    currentItemId = item?.id || null;
    modalTitle.textContent = item ? 'Edit Item' : 'Add New Item';
    nameInput.value = item?.name || '';
    descInput.value = item?.description || '';
    modal.classList.remove('hidden');
}
function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal)
        return;
    modal.classList.add('hidden');
    currentItemId = null;
}
async function handleSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById('item-name');
    const descInput = document.getElementById('item-description');
    const item = {};
    // For PUT (editing existing item), include all fields
    if (currentItemId) {
        item.name = nameInput.value;
        item.description = descInput.value;
    }
    else {
        // For POST (new item), name is required
        if (!nameInput.value.trim()) {
            alert('Name is required');
            return;
        }
        item.name = nameInput.value;
        if (descInput.value.trim()) {
            item.description = descInput.value;
        }
    }
    try {
        const url = currentItemId ? `/api/items/${currentItemId}` : '/api/items';
        const method = currentItemId
            ? (Object.keys(item).length === 2 ? 'PUT' : 'PATCH')
            : 'POST';
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save item');
        }
        closeModal();
        fetchItems();
    }
    catch (error) {
        console.error('Error saving item:', error);
        alert(error instanceof Error ? error.message : 'Failed to save item');
    }
}
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?'))
        return;
    try {
        const response = await fetch(`/api/items/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok)
            throw new Error('Failed to delete item');
        fetchItems();
    }
    catch (error) {
        console.error('Error deleting item:', error);
    }
}
async function editItem(id) {
    try {
        const response = await fetch(`/api/items/${id}`);
        const item = await response.json();
        openModal(item);
    }
    catch (error) {
        console.error('Error fetching item:', error);
    }
}
