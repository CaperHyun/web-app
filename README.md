# Digital Closet Web Application

A web application built with Node.js, Express, and SQLite3 that helps you manage your clothing items digitally. This application allows you to add, edit, and delete clothing items, with support for bulk imports via CSV files.

## Features

- Create, Read, Update, and Delete clothing items
- Bulk import items via CSV
- Image support for clothing items
- Responsive, mobile-friendly design
- SQLite database for data persistence

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Local Installation

1. Clone the repository:
bash
git clone https://github.com/your-username/web-app.git
cd web-app

2. Install dependencies:
bash
npm install

3. Create a `.env` file in the root directory (optional):
env
PORT=3000
NODE_ENV=development

4. Build the application:
bash
npm run build

5. Start the application:
bash
npm start

For development with auto-reload:
bash
npm run dev

6. Open your browser and navigate to `http://localhost:3000`


## CSV Import Format
To import items in bulk, prepare a CSV file with the following columns:
- name (required)
- category (required)
- color (required)
- description (optional)
- image_url (optional)

Example:
csv
name,category,color,description,image_url
Blue Jeans,bottoms,blue,Favorite pair of jeans,https://example.com/jeans.jpg

## Live Demo

- GitHub Repository: https://github.com/your-username/web-app
- Live Demo: https://web-app-3o5f.onrender.com/

## Technologies Used

- Node.js
- Express
- SQLite3
- TypeScript
- Tailwind CSS