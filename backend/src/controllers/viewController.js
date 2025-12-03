const supabase = require('../supabase/supabaseClient');

// Helper Format Data (Disederhanakan)
const formatPlace = (item) => ({
    id: item.id,
    nama: item.name,
    // HAPUS bagian item.cities.name, ganti string biasa dulu
    kota: "Indonesia", 
    kategori: "Kuliner",
    rating: 4.8,
    harga: item.price_range || "Tanya di lokasi",
    img: item.image_url || "https://source.unsplash.com/400x300/?food",
    desc: item.description,
    lat: item.lat,
    lng: item.lng
});

// 1. HOME PAGE
exports.renderHome = async (req, res) => {
    try {
        // HAPUS ', cities(name)' -> Ambil semua kolom biasa saja
        let { data, error } = await supabase
            .from('places')
            .select('*') 
            .limit(6);

        if (error) {
            console.error("Supabase Error:", error.message); // <--- Biar muncul di terminal
            throw error;
        }
        
        const formattedData = data.map(formatPlace);
        res.render('home', { data: formattedData });
    } catch (err) {
        console.error(err); // <--- Cek terminal kamu setelah refresh browser!
        res.status(500).send("Error: " + err.message); // Tampilkan error di browser biar jelas
    }
};

// 2. SEARCH PAGE
exports.renderSearch = async (req, res) => {
    try {
        const query = req.query.q ? req.query.q.toLowerCase() : "";
        
        // HAPUS ', cities(name)'
        let { data, error } = await supabase
            .from('places')
            .select('*');

        if (error) throw error;

        const formattedData = data.map(formatPlace);
        const results = formattedData.filter(item => 
            item.nama.toLowerCase().includes(query) || 
            (item.desc && item.desc.toLowerCase().includes(query)) // Tambah cek null
        );

        res.render('search', { results, keyword: query, city: "" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error Search: " + err.message);
    }
};

// 3. DETAIL PAGE
exports.renderDetail = async (req, res) => {
    try {
        const id = req.params.id;
        
        // HAPUS ', cities(name)'
        let { data, error } = await supabase
            .from('places')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return res.send("Tempat tidak ditemukan");

        res.render('detail', { item: formatPlace(data) });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error Detail: " + err.message);
    }
};