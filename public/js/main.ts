interface Item {
  id?: number;
  name: string;
  category: string;
  color: string;
  description?: string;
  image_url?: string;
  date_created?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

let currentItemId: number | null = null;
let currentPage = 1;
const itemsPerPage = 10;

// Add debounce function for search
function debounce(func: Function, wait: number): Function {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function fetchItems(): Promise<void> {
  try {
    const idInput = document.getElementById('id-input') as HTMLInputElement;
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const startDateInput = document.getElementById('start-date') as HTMLInputElement;
    const endDateInput = document.getElementById('end-date') as HTMLInputElement;

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
  } catch (error) {
    console.error('Failed to fetch items:', error);
  }
}

function renderPagination(pagination: PaginationData): void {
  const paginationEl = document.getElementById('pagination');
  if (!paginationEl) return;

  const pages: string[] = [];
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

function changePage(page: number): void {
  currentPage = page;
  fetchItems();
}

// Update the existing renderItems function
function renderItems(items: Item[]): void {
  const itemsList = document.getElementById('items-list');
  if (!itemsList) return;

  if (items.length === 0) {
    itemsList.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-pink-400 text-lg">✨ No items found ✨</p>
        <p class="text-gray-400 mt-2">Try adjusting your search or add some new items</p>
      </div>
    `;
    return;
  }

  itemsList.innerHTML = items.map(item => `
    <div class="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div class="relative group">
        <!-- Image container with fixed aspect ratio -->
        <div class="relative pt-[125%]">
          <img 
            src="${item.image_url || 'https://via.placeholder.com/300x400?text=No+Image'}" 
            alt="${item.name}"
            class="absolute inset-0 w-full h-full object-cover"
          >
          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex gap-2">
              <button onclick="editItem(${item.id})"
                class="bg-white text-pink-600 px-4 py-2 rounded-full hover:bg-pink-50 transform hover:scale-105 transition duration-200">
                Edit
              </button>
              <button onclick="deleteItem(${item.id})"
                class="bg-white text-pink-600 px-4 py-2 rounded-full hover:bg-pink-50 transform hover:scale-105 transition duration-200">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Item details -->
      <div class="p-4">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-medium text-gray-800">${item.name}</h3>
            <p class="text-sm text-gray-500 mt-1">${item.category || ''}</p>
          </div>
          <span class="inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-sm">
            ${item.color || ''}
          </span>
        </div>
        
        ${item.description ? `
          <p class="text-gray-600 text-sm mt-2 line-clamp-2">${item.description}</p>
        ` : ''}
        
        <div class="mt-3 text-xs text-gray-400">
          Added ${new Date(item.date_created!).toLocaleDateString()}
        </div>
      </div>
    </div>
  `).join('');
}

// Add search and filter controls to the HTML
function addSearchControls(): void {
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

  searchInput?.addEventListener('input', (e: Event) => debouncedFetch());
  startDate?.addEventListener('change', (e: Event) => fetchItems());
  endDate?.addEventListener('change', (e: Event) => fetchItems());
  
  // Fixed ID search listener
  idInput?.addEventListener('input', (e: Event) => {
    const input = e.target as HTMLInputElement;
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

function openModal(item?: Item): void {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const nameInput = document.getElementById('item-name') as HTMLInputElement;
  const descInput = document.getElementById('item-description') as HTMLTextAreaElement;
  
  if (!modal || !modalTitle || !nameInput || !descInput) return;

  currentItemId = item?.id || null;
  modalTitle.textContent = item ? 'Edit Item' : 'Add New Item';
  nameInput.value = item?.name || '';
  descInput.value = item?.description || '';
  
  modal.classList.remove('hidden');
}

function closeModal(): void {
  const modal = document.getElementById('modal');
  if (!modal) return;
  
  modal.classList.add('hidden');
  currentItemId = null;
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  
  const nameInput = document.getElementById('item-name') as HTMLInputElement;
  const descInput = document.getElementById('item-description') as HTMLTextAreaElement;
  
  const item: Partial<Item> = {};
  
  // For PUT (editing existing item), include all fields
  if (currentItemId) {
    item.name = nameInput.value;
    item.description = descInput.value;
  } else {
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
  } catch (error) {
    console.error('Error saving item:', error);
    alert(error instanceof Error ? error.message : 'Failed to save item');
  }
}

async function deleteItem(id: number): Promise<void> {
  if (!confirm('Are you sure you want to delete this item?')) return;
  
  try {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete item');
    
    fetchItems();
  } catch (error) {
    console.error('Error deleting item:', error);
  }
}

async function editItem(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/items/${id}`);
    const item = await response.json();
    openModal(item);
  } catch (error) {
    console.error('Error fetching item:', error);
  }
}

async function handleFileImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/items/import', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Import failed');
        }

        const result = await response.json();
        alert(`Successfully imported ${result.imported} items`);
        fetchItems();
    } catch (error) {
        console.error('Error importing items:', error);
        alert('Failed to import items');
    } finally {
        input.value = ''; // Reset file input
    }
} 