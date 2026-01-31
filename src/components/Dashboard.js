import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTitle, setSearchTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // API function to get all products
  const getAll = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.escuelajs.co/api/v1/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    getAll();
  }, []);

  // Handle search by title
  useEffect(() => {
    let filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchTitle.toLowerCase())
    );

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue = sortBy === 'price' ? a.price : a.title.toLowerCase();
        let bValue = sortBy === 'price' ? b.price : b.title.toLowerCase();

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filtering/sorting changes
  }, [searchTitle, products, sortBy, sortOrder]);

  // Handle sort button click
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading products...</p></div>;
  }

  if (error) {
    return <div className="dashboard-container"><p>Error: {error}</p></div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Product Dashboard</h1>

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by product title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Items Per Page Selection */}
      <div className="pagination-controls">
        <label htmlFor="items-per-page">Items per page: </label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="select-items"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>
                Title
                <button
                  className="sort-btn"
                  onClick={() => handleSort('title')}
                  title="Sort by title"
                >
                  {sortBy === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                </button>
              </th>
              <th>
                Price
                <button
                  className="sort-btn"
                  onClick={() => handleSort('price')}
                  title="Sort by price"
                >
                  {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                </button>
              </th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product, index) => (
              <tr key={product.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{product.id}</td>
                <td className="image-cell">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} className="product-image" />
                  ) : (
                    <span>No image</span>
                  )}
                </td>
                <td>{product.title}</td>
                <td className="price-cell">${product.price}</td>
                <td>
                  {product.category?.name || 'N/A'}
                  <div className="description-content">
                    <strong>{product.title}</strong>
                    <p>{product.description}</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-section">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="pagination-btn"
        >
          Next
        </button>
      </div>

      {/* Results Info */}
      <div className="results-info">
        Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
      </div>
    </div>
  );
};

export default Dashboard;
