import { countryCodes } from './countryCodes';

// Common cities for major countries to help with validation
const majorCities = {
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans', 'Wichita'],
  'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Mississauga', 'Winnipeg', 'Quebec City', 'Hamilton', 'Brampton', 'Surrey', 'Laval', 'Halifax', 'London', 'Markham', 'Vaughan', 'Gatineau', 'Saskatoon', 'Longueuil', 'Burnaby', 'Regina', 'Richmond', 'Richmond Hill', 'Oakville', 'Burlington', 'Sherbrooke', 'Oshawa', 'Saguenay', 'Lévis'],
  'GB': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Coventry', 'Bradford', 'Belfast', 'Nottingham', 'Kingston upon Hull', 'Newcastle upon Tyne', 'Stoke-on-Trent', 'Southampton', 'Derby', 'Portsmouth', 'Brighton', 'Plymouth', 'Northampton', 'Reading', 'Luton', 'Wolverhampton', 'Bolton', 'Bournemouth', 'Norwich'],
  'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury', 'Bundaberg', 'Coffs Harbour', 'Wagga Wagga', 'Hervey Bay', 'Mildura', 'Shepparton', 'Port Macquarie'],
  'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen', 'Mönchengladbach', 'Braunschweig', 'Chemnitz', 'Kiel', 'Aachen'],
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Angers', 'Grenoble', 'Dijon', 'Nîmes', 'Aix-en-Provence', 'Saint-Quentin-en-Yvelines', 'Brest', 'Le Mans', 'Amiens', 'Tours', 'Limoges', 'Clermont-Ferrand', 'Villeurbanne', 'Besançon', 'Orléans'],
  'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Taranto', 'Brescia', 'Prato', 'Parma', 'Reggio Calabria', 'Modena', 'Reggio Emilia', 'Perugia', 'Livorno', 'Ravenna', 'Cagliari', 'Foggia', 'Rimini', 'Salerno', 'Ferrara'],
  'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet de Llobregat', 'A Coruña', 'Vitoria-Gasteiz', 'Granada', 'Elche', 'Oviedo', 'Badalona', 'Cartagena', 'Terrassa', 'Jerez de la Frontera', 'Sabadell', 'Móstoles', 'Santa Cruz de Tenerife', 'Pamplona', 'Almería'],
  'JP': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Okayama', 'Sagamihara', 'Shizuoka', 'Kumamoto', 'Kagoshima', 'Matsuyama', 'Kanazawa', 'Utsunomiya', 'Matsudo', 'Kawaguchi', 'Himeji', 'Fujisawa', 'Toyama'],
  'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi'],
  'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina', 'Campo Grande', 'Nova Iguaçu', 'São Bernardo do Campo', 'João Pessoa', 'Santo André', 'Osasco', 'Jaboatão dos Guararapes', 'Contagem', 'São José dos Campos', 'Uberlândia']
};

// Get suggestions based on partial input
export const getLocationSuggestions = (input, countryCode, limit = 10) => {
  if (!input || input.length < 2) return [];
  
  const suggestions = [];
  const inputLower = input.toLowerCase();
  
  // Get cities for the selected country
  const cities = majorCities[countryCode] || [];
  
  // Find matching cities
  cities.forEach(city => {
    if (city.toLowerCase().includes(inputLower)) {
      const country = countryCodes.find(c => c.code === countryCode);
      suggestions.push({
        city,
        country: country?.name || '',
        fullLocation: `${city}, ${country?.name || ''}`,
        type: 'city'
      });
    }
  });
  
  // Add country name if it matches
  const matchingCountries = countryCodes.filter(country => 
    country.name.toLowerCase().includes(inputLower)
  );
  
  matchingCountries.forEach(country => {
    suggestions.push({
      city: '',
      country: country.name,
      fullLocation: country.name,
      type: 'country'
    });
  });
  
  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions.filter((item, index, self) => 
    index === self.findIndex(t => t.fullLocation === item.fullLocation)
  );
  
  return uniqueSuggestions.slice(0, limit);
};

// Validate location format
export const validateLocation = (location, countryCode) => {
  if (!location || location.trim().length === 0) {
    return { isValid: true, message: '' }; // Optional field
  }
  
  const trimmedLocation = location.trim();
  
  // Basic length validation
  if (trimmedLocation.length < 2) {
    return { 
      isValid: false, 
      message: 'Location must be at least 2 characters long' 
    };
  }
  
  if (trimmedLocation.length > 100) {
    return { 
      isValid: false, 
      message: 'Location must be less than 100 characters' 
    };
  }
  
  // Check for valid characters (letters, spaces, commas, hyphens, apostrophes)
  const validLocationRegex = /^[a-zA-Z\s,.\-'()]+$/;
  if (!validLocationRegex.test(trimmedLocation)) {
    return { 
      isValid: false, 
      message: 'Location contains invalid characters' 
    };
  }
  
  // Check if it's a reasonable location format
  const parts = trimmedLocation.split(',').map(part => part.trim());
  
  // If multiple parts, validate each part
  for (const part of parts) {
    if (part.length === 0) {
      return { 
        isValid: false, 
        message: 'Invalid location format' 
      };
    }
    
    // Each part should start with a letter
    if (!/^[a-zA-Z]/.test(part)) {
      return { 
        isValid: false, 
        message: 'Location parts must start with a letter' 
      };
    }
  }
  
  return { isValid: true, message: 'Valid location' };
};

// Format location consistently
export const formatLocation = (location) => {
  if (!location) return '';
  
  return location
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(', ');
};

// Check if location exists in our database of known cities
export const isKnownLocation = (location, countryCode) => {
  if (!location || !countryCode) return false;
  
  const cities = majorCities[countryCode] || [];
  const locationLower = location.toLowerCase();
  
  // Check if it's a known city
  const isKnownCity = cities.some(city => 
    city.toLowerCase() === locationLower ||
    locationLower.includes(city.toLowerCase())
  );
  
  // Check if it's a country name
  const isKnownCountry = countryCodes.some(country =>
    country.name.toLowerCase() === locationLower ||
    locationLower.includes(country.name.toLowerCase())
  );
  
  return isKnownCity || isKnownCountry;
};