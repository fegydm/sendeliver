// File: src/shared/components/elements/shared.ldriver-lcard.comp.tsx
import "@/styles/component./shared.ldriver-lcard.css";

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  photo: string;
  address: string;
  driverId: string;           // Číslo vodičského preukazu
  licenseId: string;          // Číslo občianskeho preukazu
  phone: string;
  email: string;
  experience: string;         // Roky skúseností
  driverType: string;         // Typ vodiča (Full-time, Part-time)
  payrollId: string;          // Mzdové číslo
  birthDate: string;          // Dátum narodenia
  nationality: string;        // Národnosť
  truckId: string;            // ID prideleného kamiónu
  medicalCheck: string;       // Dátum poslednej lekárskej prehliadky
  licenseExpiration: string;  // Dátum vypršania vodičského preukazu
  training: string;           // Absolvované školenie (napr. ADR)
  status: string;             // Aktuálny stav (Aktívny, Neaktívny)
  emergencyContact: string;   // Núdzový kontakt
}

const DriverCard: React.FC = () => {
  const [selectedDriver, setSelectedDriver] = useState<driver | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Údaje pre 4 vodičov
  const drivers: Driver[] = [
    {
      id: '1',
      firstName: 'Ján',
      lastName: 'Kováč',
      photo: '/src/assets/jan_kovac.jpg',
      address: 'Hlavná 15, 811 01 Bratislava',
      driverId: 'SK123456',
      licenseId: 'AB789123',
      phone: '+421 905 123 456',
      email: 'jan.kovac@example.com',
      experience: '8 rokov',
      driverType: 'Full-time',
      payrollId: 'PAY001',
      birthDate: '15.03.1985',
      nationality: 'Slovenská',
      truckId: 'TRK001',
      medicalCheck: '10.01.2025',
      licenseExpiration: '20.06.2027',
      training: 'ADR, Bezpečnostné školenie',
      status: 'Aktívny',
      emergencyContact: '+421 905 987 654 (manželka Anna)',
    },
    {
      id: '2',
      firstName: 'Peter',
      lastName: 'Novák',
      photo: '/src/assets/peter_novak.jpg',
      address: 'Mierová 22, 040 01 Košice',
      driverId: 'SK654321',
      licenseId: 'CD456789',
      phone: '+421 908 456 789',
      email: 'peter.novak@example.com',
      experience: '5 rokov',
      driverType: 'Full-time',
      payrollId: 'PAY002',
      birthDate: '22.07.1990',
      nationality: 'Slovenská',
      truckId: 'TRK002',
      medicalCheck: '15.02.2025',
      licenseExpiration: '10.09.2026',
      training: 'ADR',
      status: 'Aktívny',
      emergencyContact: '+421 908 123 456 (brat Martin)',
    },
    {
      id: '3',
      firstName: 'Martin',
      lastName: 'Horváth',
      photo: '/src/assets/martin_horvath.jpg',
      address: 'Slnečná 10, 949 01 Nitra',
      driverId: 'SK987654',
      licenseId: 'EF123456',
      phone: '+421 907 789 123',
      email: 'martin.horvath@example.com',
      experience: '10 rokov',
      driverType: 'Part-time',
      payrollId: 'PAY003',
      birthDate: '05.11.1978',
      nationality: 'Slovenská',
      truckId: 'TRK003',
      medicalCheck: '20.12.2024',
      licenseExpiration: '15.03.2028',
      training: 'ADR, Školenie na nakladanie',
      status: 'Aktívny',
      emergencyContact: '+421 907 456 789 (sestra Lucia)',
    },
    {
      id: '4',
      firstName: 'Tomáš',
      lastName: 'Ďurica',
      photo: '/src/assets/tomas_durica.jpg',
      address: 'Lesná 5, 010 01 Žilina',
      driverId: 'SK321987',
      licenseId: 'GH789456',
      phone: '+421 904 321 987',
      email: 'tomas.durica@example.com',
      experience: '3 roky',
      driverType: 'Full-time',
      payrollId: 'PAY004',
      birthDate: '30.09.1995',
      nationality: 'Slovenská',
      truckId: 'TRK004',
      medicalCheck: '05.03.2025',
      licenseExpiration: '25.12.2025',
      training: 'Základné školenie',
      status: 'Aktívny',
      emergencyContact: '+421 904 654 321 (otec Jozef)',
    },
  ];

  const filteredDrivers = drivers.filter(driver =>
    `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="driver-container">
      {/* Ľavý kontajner s malou fotkou a menom */}
      <div className="driver-sidebar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Vyhľadať vodiča"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon" />
        </div>
        <div className="drivers-list">
          {filteredDrivers.map(driver => (
            <div
              key={driver.id}
              className={`driver-item ${selectedDriver?.id === driver.id ? 'selected' : ''}`}
              onClick={() => setSelectedDriver(driver)}
            >
              <img
                src={driver.photo}
                alt={`${driver.firstName} ${driver.lastName}`}
                className="driver-photo-small"
              />
              <span className="driver-name">{driver.firstName} {driver.lastName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pravý kontajner s detailmi */}
      <div className="driver-detail">
        {selectedDriver ? (
          <>
            <img
              src={selectedDriver.photo}
              alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
              className="driver-photo-large"
            />
            <h2>{selectedDriver.firstName} {selectedDriver.lastName}</h2>

            <div className="form-group">
              <label className="form-label">Adresa</label>
              <input type="text" className="form-input" value={selectedDriver.address} readOnly />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Číslo vodičského preukazu</label>
                <input type="text" className="form-input" value={selectedDriver.driverId} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Číslo občianskeho preukazu</label>
                <input type="text" className="form-input" value={selectedDriver.licenseId} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Telefón</label>
                <input type="text" className="form-input" value={selectedDriver.phone} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={selectedDriver.email} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Dátum narodenia</label>
                <input type="text" className="form-input" value={selectedDriver.birthDate} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Národnosť</label>
                <input type="text" className="form-input" value={selectedDriver.nationality} readOnly />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skúsenosti</label>
              <input type="text" className="form-input" value={selectedDriver.experience} readOnly />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Typ vodiča</label>
                <input type="text" className="form-input" value={selectedDriver.driverType} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Mzdové číslo</label>
                <input type="text" className="form-input" value={selectedDriver.payrollId} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ID kamiónu</label>
                <input type="text" className="form-input" value={selectedDriver.truckId} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Stav</label>
                <input type="text" className="form-input" value={selectedDriver.status} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Posledná lekárska prehliadka</label>
                <input type="text" className="form-input" value={selectedDriver.medicalCheck} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Platnosť vodičského preukazu</label>
                <input type="text" className="form-input" value={selectedDriver.licenseExpiration} readOnly />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Absolvované školenia</label>
              <input type="text" className="form-input" value={selectedDriver.training} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Núdzový kontakt</label>
              <input type="text" className="form-input" value={selectedDriver.emergencyContact} readOnly />
            </div>
          </>
        ) : (
          <p>Vyberte vodiča zo zoznamu</p>
        )}
      </div>
    </div>
  );
};

export default DriverCard;