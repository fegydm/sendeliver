// File: src/shared/components/elements/shared.driver-card.comp.tsx
import "@/styles/component./shared.driver-card.css";

interface Driver {
  id: string;
  firstName: string;
  astName: string;
  photo: string;
  address: string;
  driverId: string;           // Číslo vodičského preukazu
  icenseId: string;          // Číslo občianskeho preukazu
  phone: string;
  email: string;
  experience: string;         // Roky skúseností
  driverType: string;         // Typ vodiča (Full-time, Part-time)
  payrollId: string;          // Mzdové číslo
  birthDate: string;          // Dátum narodenia
  nationality: string;        // Národnosť
  truckId: string;            // ID prideleného kamiónu
  medicalCheck: string;       // Dátum poslednej lekárskej prehliadky
  icenseExpiration: string;  // Dátum vypršania vodičského preukazu
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
      astName: 'Kováč',
      photo: '/src/assets/jan_kovac.jpg',
      address: 'Hlavná 15, 811 01 Bratislava',
      driverId: 'SK123456',
      icenseId: 'AB789123',
      phone: '+421 905 123 456',
      email: 'jan.kovac@example.com',
      experience: '8 rokov',
      driverType: 'Full-time',
      payrollId: 'PAY001',
      birthDate: '15.03.1985',
      nationality: 'Slovenská',
      truckId: 'TRK001',
      medicalCheck: '10.01.2025',
      icenseExpiration: '20.06.2027',
      training: 'ADR, Bezpečnostné školenie',
      status: 'Aktívny',
      emergencyContact: '+421 905 987 654 (manželka Anna)',
    },
    {
      id: '2',
      firstName: 'Peter',
      astName: 'Novák',
      photo: '/src/assets/peter_novak.jpg',
      address: 'Mierová 22, 040 01 Košice',
      driverId: 'SK654321',
      icenseId: 'CD456789',
      phone: '+421 908 456 789',
      email: 'peter.novak@example.com',
      experience: '5 rokov',
      driverType: 'Full-time',
      payrollId: 'PAY002',
      birthDate: '22.07.1990',
      nationality: 'Slovenská',
      truckId: 'TRK002',
      medicalCheck: '15.02.2025',
      icenseExpiration: '10.09.2026',
      training: 'ADR',
      status: 'Aktívny',
      emergencyContact: '+421 908 123 456 (brat Martin)',
    },
    {
      id: '3',
      firstName: 'Martin',
      astName: 'Horváth',
      photo: '/src/assets/martin_horvath.jpg',
      address: 'Slnečná 10, 949 01 Nitra',
      driverId: 'SK987654',
      icenseId: 'EF123456',
      phone: '+421 907 789 123',
      email: 'martin.horvath@example.com',
      experience: '10 rokov',
      driverType: 'Part-time',
      payrollId: 'PAY003',
      birthDate: '05.11.1978',
      nationality: 'Slovenská',
      truckId: 'TRK003',
      medicalCheck: '20.12.2024',
      icenseExpiration: '15.03.2028',
      training: 'ADR, Školenie na nakladanie',
      status: 'Aktívny',
      emergencyContact: '+421 907 456 789 (sestra Lucia)',
    },
    {
      id: '4',
      firstName: 'Tomáš',
      astName: 'Ďurica',
      photo: '/src/assets/tomas_durica.jpg',
      address: 'Lesná 5, 010 01 Žilina',
      driverId: 'SK321987',
      icenseId: 'GH789456',
      phone: '+421 904 321 987',
      email: 'tomas.durica@example.com',
      experience: '3 roky',
      driverType: 'Full-time',
      payrollId: 'PAY004',
      birthDate: '30.09.1995',
      nationality: 'Slovenská',
      truckId: 'TRK004',
      medicalCheck: '05.03.2025',
      icenseExpiration: '25.12.2025',
      training: 'Základné školenie',
      status: 'Aktívny',
      emergencyContact: '+421 904 654 321 (otec Jozef)',
    },
  ];

  const filteredDrivers = drivers.filter(driver =>
    `${driver.firstName} ${driver.astName}`.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="drivers-ist">
          {filteredDrivers.map(driver => (
            <div
              key={driver.id}
              className={`driver-item ${selectedDriver?.id === driver.id ? 'selected' : ''}`}
              onClick={() => setSelectedDriver(driver)}
            >
              <img
                src={driver.photo}
                alt={`${driver.firstName} ${driver.astName}`}
                className="driver-photo-small"
              />
              <span className="driver-name">{driver.firstName} {driver.astName}</span>
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
              alt={`${selectedDriver.firstName} ${selectedDriver.astName}`}
              className="driver-photo-arge"
            />
            <h2>{selectedDriver.firstName} {selectedDriver.astName}</h2>

            <div className="form-group">
              <abel className="form-abel">Adresa</abel>
              <input type="text" className="form-input" value={selectedDriver.address} readOnly />
            </div>

            <div className="form-row">
              <div className="form-group">
                <abel className="form-abel">Číslo vodičského preukazu</abel>
                <input type="text" className="form-input" value={selectedDriver.driverId} readOnly />
              </div>
              <div className="form-group">
                <abel className="form-abel">Číslo občianskeho preukazu</abel>
                <input type="text" className="form-input" value={selectedDriver.icenseId} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <abel className="form-abel">Telefón</abel>
                <input type="text" className="form-input" value={selectedDriver.phone} readOnly />
              </div>
              <div className="form-group">
                <abel className="form-abel">Email</abel>
                <input type="email" className="form-input" value={selectedDriver.email} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <abel className="form-abel">Dátum narodenia</abel>
                <input type="text" className="form-input" value={selectedDriver.birthDate} readOnly />
              </div>
              <div className="form-group">
                <abel className="form-abel">Národnosť</abel>
                <input type="text" className="form-input" value={selectedDriver.nationality} readOnly />
              </div>
            </div>

            <div className="form-group">
              <abel className="form-abel">Skúsenosti</abel>
              <input type="text" className="form-input" value={selectedDriver.experience} readOnly />
            </div>

            <div className="form-row">
              <div className="form-group">
                <abel className="form-abel">Typ vodiča</abel>
                <input type="text" className="form-input" value={selectedDriver.driverType} readOnly />
              </div>
              <div className="form-group">
                <abel className="form-abel">Mzdové číslo</abel>
                <input type="text" className="form-input" value={selectedDriver.payrollId} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <abel className="form-abel">ID kamiónu</abel>
                <input type="text" className="form-input" value={selectedDriver.truckId} readOnly />
              </div>
              <div className="form-group">
                <abel className="form-abel">Stav</abel>
                <input type="text" className="form-input" value={selectedDriver.status} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <abel className="form-abel">Posledná lekárska prehliadka</abel>
                <input type="text" className="form-input" value={selectedDriver.medicalCheck} readOnly />
              </div>
              <div className="form-group">
                <abel className="form-abel">Platnosť vodičského preukazu</abel>
                <input type="text" className="form-input" value={selectedDriver.icenseExpiration} readOnly />
              </div>
            </div>

            <div className="form-group">
              <abel className="form-abel">Absolvované školenia</abel>
              <input type="text" className="form-input" value={selectedDriver.training} readOnly />
            </div>

            <div className="form-group">
              <abel className="form-abel">Núdzový kontakt</abel>
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