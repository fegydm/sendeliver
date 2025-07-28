// File: front/src/app/hauler/operations/team/team.tsx
// Last change: Created complete team management with fleet-style layout

import React, { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'DRIVER' | 'DISPATCHER' | 'ACCOUNTANT' | 'MANAGER' | 'ADMIN';
  avatarUrl?: string;
  startDate?: string;
  salary?: number;
  licenseNumber?: string;
  licenseExpiry?: string;
  workSchedule?: string;
  isSample?: boolean;
}

const TeamOperations: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'DRIVER' | 'DISPATCHER' | 'ACCOUNTANT' | 'MANAGER' | 'ADMIN'>('ALL');
  const [showSampleData, setShowSampleData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data
  const sampleEmployees: Employee[] = [
    {
      id: 'sample-1',
      name: 'Ján Novák',
      email: 'jan.novak@sendeliver.com',
      phone: '+421 901 234 567',
      role: 'DRIVER',
      avatarUrl: '/avatars/driver1.jpg',
      startDate: '2023-01-15',
      salary: 1200,
      licenseNumber: 'SK123456789',
      licenseExpiry: '2025-12-31',
      workSchedule: 'Denná zmena (6:00 - 14:00)',
      isSample: true
    },
    {
      id: 'sample-2',
      name: 'Mária Svobodová',
      email: 'maria.svobodova@sendeliver.com',
      phone: '+421 905 987 654',
      role: 'DISPATCHER',
      avatarUrl: '/avatars/dispatcher1.jpg',
      startDate: '2022-08-20',
      salary: 1000,
      isSample: true
    },
    {
      id: 'sample-3',
      name: 'Peter Kováč',
      email: 'peter.kovac@sendeliver.com',
      phone: '+421 907 555 123',
      role: 'ACCOUNTANT',
      avatarUrl: '/avatars/accountant1.jpg',
      startDate: '2021-03-10',
      salary: 1400,
      isSample: true
    },
    {
      id: 'sample-4',
      name: 'Anna Poláková',
      email: 'anna.polakova@sendeliver.com',
      phone: '+421 902 111 222',
      role: 'DRIVER',
      avatarUrl: '/avatars/driver2.jpg',
      startDate: '2023-06-01',
      salary: 1300,
      licenseNumber: 'SK987654321',
      licenseExpiry: '2026-05-15',
      workSchedule: 'Nočná zmena (22:00 - 6:00)',
      isSample: true
    }
  ];

  // Initialize data
  useEffect(() => {
    const realEmployees: Employee[] = [
      // Add some real employees for demonstration
    ];
    
    setEmployees(realEmployees);
    if (realEmployees.length > 0) {
      setSelectedEmployee(realEmployees[0]);
    }
  }, []);

  // Filter employees
  const filteredEmployees = React.useMemo(() => {
    let filtered = showSampleData ? [...employees, ...sampleEmployees] : employees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(emp => emp.role === selectedRole);
    }

    return filtered;
  }, [employees, sampleEmployees, searchTerm, selectedRole, showSampleData]);

  // Handle functions
  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditEmployee = () => {
    if (!selectedEmployee || selectedEmployee.isSample) return;
    console.log('Upraviť zamestnanca:', selectedEmployee.name);
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee || selectedEmployee.isSample) return;
    
    if (window.confirm(`Naozaj chcete odstrániť zamestnanca ${selectedEmployee.name}?`)) {
      const updatedEmployees = employees.filter(emp => emp.id !== selectedEmployee.id);
      setEmployees(updatedEmployees);
      
      if (updatedEmployees.length > 0) {
        const currentIndex = employees.findIndex(emp => emp.id === selectedEmployee.id);
        const nextEmployee = updatedEmployees[currentIndex] || updatedEmployees[currentIndex - 1] || updatedEmployees[0];
        setSelectedEmployee(nextEmployee);
      } else {
        setSelectedEmployee(null);
      }
    }
  };

  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: 'Nový zamestnanec',
      email: 'novy@example.com',
      role: 'DRIVER',
      avatarUrl: '/avatars/default.png',
      isSample: false
    };
    
    setEmployees([newEmployee, ...employees]);
    setSelectedEmployee(newEmployee);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('ALL');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'DRIVER': return 'Vodič';
      case 'DISPATCHER': return 'Dispečer';
      case 'ACCOUNTANT': return 'Účtovník';
      case 'MANAGER': return 'Manažér';
      case 'ADMIN': return 'Administrátor';
      default: return role;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Toolbar navrchu */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px 8px 0 0',
        height: '28px',
        borderBottom: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: '#6c757d', marginRight: '12px' }}>
            {filteredEmployees.length} zamestnancov
          </span>
          
          <button
            onClick={handleResetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#495057',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            title="Resetovať filtre"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
              <path d="M3 6h18M6 12h12M10 18h4"></path>
            </svg>
          </button>
          
          <div style={{
            width: '1px',
            height: '24px',
            backgroundColor: '#6c757d',
            opacity: 0.3,
            margin: '0 8px'
          }}></div>
          
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#6c757d',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={showSampleData}
              onChange={(e) => setShowSampleData(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            Zobraziť ukážkové dáta
          </label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleDeleteEmployee}
            disabled={!selectedEmployee || selectedEmployee?.isSample}
            style={{
              background: 'none',
              border: 'none',
              color: !selectedEmployee || selectedEmployee?.isSample ? '#adb5bd' : '#495057',
              cursor: !selectedEmployee || selectedEmployee?.isSample ? 'not-allowed' : 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            title="Odstrániť zamestnanca"
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#e9ecef';
              }
            }}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
            </svg>
          </button>
          
          <button
            onClick={handleAddEmployee}
            style={{
              background: 'none',
              border: 'none',
              color: '#495057',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            title="Pridať zamestnanca"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
          
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#495057',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            title="Vyhľadávanie"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Hlavný obsah - sidebar + detail panel */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        borderRadius: '0 0 8px 8px'
      }}>
        {/* Sidebar so zoznamom zamestnancov */}
        <div style={{
          width: '300px',
          borderRight: '1px solid #e9ecef',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            padding: '12px',
            borderBottom: '1px solid #e9ecef'
          }}>
            <input
              type="text"
              placeholder="Vyhľadať zamestnanca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#495057',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ced4da'}
            />
          </div>
          
          <div style={{
            padding: '12px',
            borderBottom: '1px solid #e9ecef'
          }}>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#495057',
                fontSize: '13px'
              }}
            >
              <option value="ALL">Všetky pozície</option>
              <option value="DRIVER">Vodič</option>
              <option value="DISPATCHER">Dispečer</option>
              <option value="ACCOUNTANT">Účtovník</option>
              <option value="MANAGER">Manažér</option>
              <option value="ADMIN">Administrátor</option>
            </select>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 0'
          }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
                Načítavam zamestnancov...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
                Žiadni zamestnanci
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleSelectEmployee(employee)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'background-color 0.2s',
                    backgroundColor: selectedEmployee?.id === employee.id ? '#007bff' : 'transparent',
                    color: selectedEmployee?.id === employee.id ? 'white' : '#495057',
                    fontStyle: employee.isSample ? 'italic' : 'normal',
                    opacity: employee.isSample ? 0.8 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEmployee?.id !== employee.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEmployee?.id !== employee.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '12px',
                    flexShrink: 0,
                    backgroundColor: '#e9ecef'
                  }}>
                    <img
                      src={employee.avatarUrl || '/avatars/default.png'}
                      alt={employee.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#6c757d">
                            <circle cx="50" cy="35" r="20"/>
                            <path d="M20 80c0-16.569 13.431-30 30-30s30 13.431 30 30"/>
                          </svg>
                        `)}`;
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {employee.name}
                      {employee.isSample && (
                        <span style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: 500,
                          textTransform: 'uppercase'
                        }}>
                          ukážka
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: selectedEmployee?.id === employee.id ? 'rgba(255,255,255,0.8)' : '#6c757d',
                      marginBottom: '4px'
                    }}>
                      {getRoleDisplayName(employee.role)}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: employee.role === 'DRIVER' ? '#007bff' :
                                       employee.role === 'DISPATCHER' ? '#6f42c1' :
                                       employee.role === 'ACCOUNTANT' ? '#fd7e14' :
                                       '#28a745'
                      }}></div>
                      {getRoleDisplayName(employee.role)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#ffffff'
        }}>
          {selectedEmployee ? (
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                marginBottom: '32px',
                paddingBottom: '20px',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#e9ecef'
                }}>
                  <img
                    src={selectedEmployee.avatarUrl || '/avatars/default.png'}
                    alt={selectedEmployee.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#6c757d">
                          <circle cx="50" cy="35" r="20"/>
                          <path d="M20 80c0-16.569 13.431-30 30-30s30 13.431 30 30"/>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#212529'
                  }}>
                    {selectedEmployee.name}
                  </h2>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    color: '#6c757d',
                    fontWeight: 500
                  }}>
                    {getRoleDisplayName(selectedEmployee.role)}
                  </p>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>
                    {selectedEmployee.email}
                  </p>
                  {selectedEmployee.isSample && (
                    <span style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Ukážkové dáta
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {!selectedEmployee.isSample && (
                    <button
                      onClick={handleEditEmployee}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                    >
                      Upraviť
                    </button>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#212529'
                  }}>
                    Základné informácie
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {[
                      { label: 'Meno', value: selectedEmployee.name },
                      { label: 'Email', value: selectedEmployee.email },
                      { label: 'Telefón', value: selectedEmployee.phone || 'Neuvedené' },
                      { label: 'Pozícia', value: getRoleDisplayName(selectedEmployee.role) },
                      { label: 'Začiatok práce', value: selectedEmployee.startDate || 'Neuvedené' },
                      { label: 'Mzda', value: selectedEmployee.salary ? `€${selectedEmployee.salary}` : 'Neuvedené' }
                    ].map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#6c757d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {item.label}:
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: '#212529',
                          fontWeight: 500
                        }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEmployee.role === 'DRIVER' && (
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px'
                  }}>
                    <h3 style={{
                      margin: '0 0 16px 0',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#212529'
                    }}>
                      Vodičské informácie
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      {[
                        { label: 'Číslo licencie', value: selectedEmployee.licenseNumber || 'Neuvedené' },
                        { label: 'Platnosť licencie', value: selectedEmployee.licenseExpiry || 'Neuvedené' },
                        { label: 'Pracovný čas', value: selectedEmployee.workSchedule || 'Neuvedené' }
                      ].map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#6c757d',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {item.label}:
                          </span>
                          <span style={{
                            fontSize: '14px',
                            color: '#212529',
                            fontWeight: 500
                          }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: '#ffffff'
            }}>
              <div style={{
                textAlign: 'center',
                color: '#6c757d'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                  width: '64px',
                  height: '64px',
                  marginBottom: '16px',
                  opacity: 0.5
                }}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <p style={{
                  fontSize: '16px',
                  margin: 0
                }}>
                  Vyberte zamestnanca pre zobrazenie detailov
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamOperations;