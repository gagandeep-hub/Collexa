import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        condition: '',
        minPrice: '',
        maxPrice: '',
        search: '',
        sort: 'newest'
    });

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.condition) params.condition = filters.condition;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.search) params.search = filters.search;
            if (filters.sort) params.sort = filters.sort;

            const res = await productAPI.getAll(params);
            setProducts(res.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            condition: '',
            minPrice: '',
            maxPrice: '',
            search: '',
            sort: 'newest'
        });
        setSearchParams({});
    };

    return (
        <div className="products-page">
            <aside className="filters-sidebar">
                <div className="filters-header">
                    <h3>Filters</h3>
                    <button onClick={clearFilters} className="clear-btn">Clear All</button>
                </div>

                <div className="filter-group">
                    <label>Search</label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search products..."
                    />
                </div>

                <div className="filter-group">
                    <label>Category</label>
                    <select name="category" value={filters.category} onChange={handleFilterChange}>
                        <option value="">All Categories</option>
                        <option value="books">📚 Books</option>
                        <option value="electronics">💻 Electronics</option>
                        <option value="furniture">🪑 Furniture</option>
                        <option value="clothing">👕 Clothing</option>
                        <option value="sports">⚽ Sports</option>
                        <option value="stationery">✏️ Stationery</option>
                        <option value="other">📦 Other</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Condition</label>
                    <select name="condition" value={filters.condition} onChange={handleFilterChange}>
                        <option value="">All Conditions</option>
                        <option value="new">New</option>
                        <option value="like-new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Price Range</label>
                    <div className="price-inputs">
                        <input
                            type="number"
                            name="minPrice"
                            min="0"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            placeholder="Min"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            name="maxPrice"
                            min="0"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            placeholder="Max"
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Sort By</label>
                    <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </aside>

            <main className="products-main">
                <div className="products-header">
                    <h1>Trending on Collexa</h1>
                    <p>{products.length} items found</p>
                </div>

                {loading ? (
                    <div className="loading">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="no-products">
                        <span>📦</span>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Products;
