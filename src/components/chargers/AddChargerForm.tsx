import React, { useState, useEffect } from 'react';
import { 
  Charger, 
  CreateChargerRequest, 
  ChargerType, 
  ConnectorType,
  ChargerValidationError,
  Connector
} from '@/types/charger';
import { chargerService } from '@/lib/charger-service';

interface AddChargerFormProps {
  onSuccess?: (charger: Charger) => void;
  onCancel?: () => void;
}

export const AddChargerForm: React.FC<AddChargerFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateChargerRequest>({
    chargerId: '',
    stationId: '',
    name: '',
    description: '',
    type: 'AC' as ChargerType,
    manufacturer: '',
    model: '',
    serialNumber: '',
    firmwareVersion: '',
    maxPower: 0,
    connectors: [{
      type: 'Type2' as ConnectorType,
      maxPower: 22
    }],
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      latitude: 0,
      longitude: 0
    },
    installationDate: new Date().toISOString().split('T')[0] || ''
  });

  const [errors, setErrors] = useState<ChargerValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chargerIdAvailability, setChargerIdAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
  }>({ checking: false, available: null });
  const [stationIdAvailability, setStationIdAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
  }>({ checking: false, available: null });

  useEffect(() => {
    const checkChargerIdAvailability = async () => {
      if (formData.chargerId.length >= 3) {
        setChargerIdAvailability({ checking: true, available: null });
        try {
          const result = await chargerService.checkChargerIdAvailability(formData.chargerId);
          setChargerIdAvailability({ checking: false, available: result.available });
        } catch (error) {
          setChargerIdAvailability({ checking: false, available: null });
        }
      } else {
        setChargerIdAvailability({ checking: false, available: null });
      }
    };

    const timeoutId = setTimeout(checkChargerIdAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.chargerId]);

  useEffect(() => {
    const checkStationIdAvailability = async () => {
      if (formData.stationId.length >= 3) {
        setStationIdAvailability({ checking: true, available: null });
        try {
          const result = await chargerService.checkStationIdAvailability(formData.stationId);
          setStationIdAvailability({ checking: false, available: result.available });
        } catch (error) {
          setStationIdAvailability({ checking: false, available: null });
        }
      } else {
        setStationIdAvailability({ checking: false, available: null });
      }
    };

    const timeoutId = setTimeout(checkStationIdAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.stationId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
    
    setErrors(prev => prev.filter(error => error.field !== `location.${field}`));
  };

  const handleConnectorChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      connectors: prev.connectors.map((connector, i) => 
        i === index ? { ...connector, [field]: value } : connector
      )
    }));
  };

  const addConnector = () => {
    setFormData(prev => ({
      ...prev,
      connectors: [...prev.connectors, {
        type: 'Type2' as ConnectorType,
        maxPower: 22
      }]
    }));
  };

  const removeConnector = (index: number) => {
    if (formData.connectors.length > 1) {
      setFormData(prev => ({
        ...prev,
        connectors: prev.connectors.filter((_, i) => i !== index)
      }));
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(err => err.field === fieldName);
    return error?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      const result = await chargerService.createCharger(formData, 'current-user'); // In real app, get from auth context
      
      if (result.success && result.charger) {
        onSuccess?.(result.charger);
        setFormData({
          chargerId: '',
          stationId: '',
          name: '',
          description: '',
          type: 'AC',
          manufacturer: '',
          model: '',
          serialNumber: '',
          firmwareVersion: '',
          maxPower: 0,
          connectors: [{
            type: 'Type2',
            maxPower: 22
          }],
          location: {
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA',
            latitude: 0,
            longitude: 0
          },
          installationDate: new Date().toISOString().split('T')[0] || ''
        });
        setChargerIdAvailability({ checking: false, available: null });
        setStationIdAvailability({ checking: false, available: null });
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors([{ field: 'form', message: 'An unexpected error occurred. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const chargerTypes: { value: ChargerType; label: string }[] = [
    { value: 'AC', label: 'AC Charger' },
    { value: 'DC_FAST', label: 'DC Fast Charger' }
  ];

  const connectorTypes: { value: ConnectorType; label: string }[] = [
    { value: 'Type1', label: 'Type 1 (J1772)' },
    { value: 'Type2', label: 'Type 2 (Mennekes)' },
    { value: 'CCS1', label: 'CCS1 (Combo 1)' },
    { value: 'CCS2', label: 'CCS2 (Combo 2)' },
    { value: 'CHAdeMO', label: 'CHAdeMO' },
    { value: 'Tesla', label: 'Tesla Connector' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Add New Charger</h2>
        <p className="mt-1 text-sm text-slate-300">
          Add a new charging station with unique charger ID and station ID
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Charger ID */}
          <div>
            <label htmlFor="chargerId" className="block text-sm font-bold text-white mb-1">
              Charger ID *
            </label>
            <div className="relative">
              <input
                type="text"
                id="chargerId"
                value={formData.chargerId}
                onChange={(e) => handleInputChange('chargerId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  getFieldError('chargerId') ? 'border-red-500' : 
                  chargerIdAvailability.available === false ? 'border-red-500' :
                  chargerIdAvailability.available === true ? 'border-emerald-500' : 'border-slate-400'
                }`}
                placeholder="e.g., CHG-001"
                disabled={isSubmitting}
              />
              {chargerIdAvailability.checking && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
              {chargerIdAvailability.available === true && (
                <div className="absolute right-3 top-2.5 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {chargerIdAvailability.available === false && (
                <div className="absolute right-3 top-2.5 text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {getFieldError('chargerId') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('chargerId')}</p>
            )}
            {chargerIdAvailability.available === false && (
              <p className="mt-1 text-sm text-red-600">This Charger ID is already taken</p>
            )}
            {chargerIdAvailability.available === true && (
              <p className="mt-1 text-sm text-green-600">Charger ID is available</p>
            )}
          </div>

          {/* Station ID */}
          <div>
            <label htmlFor="stationId" className="block text-sm font-bold text-white mb-1">
              Station ID *
            </label>
            <div className="relative">
              <input
                type="text"
                id="stationId"
                value={formData.stationId}
                onChange={(e) => handleInputChange('stationId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  getFieldError('stationId') ? 'border-red-500' : 
                  stationIdAvailability.available === false ? 'border-red-500' :
                  stationIdAvailability.available === true ? 'border-emerald-500' : 'border-slate-400'
                }`}
                placeholder="e.g., STN-MAIN-01"
                disabled={isSubmitting}
              />
              {stationIdAvailability.checking && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
              {stationIdAvailability.available === true && (
                <div className="absolute right-3 top-2.5 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {stationIdAvailability.available === false && (
                <div className="absolute right-3 top-2.5 text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {getFieldError('stationId') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('stationId')}</p>
            )}
            {stationIdAvailability.available === false && (
              <p className="mt-1 text-sm text-red-600">This Station ID is already taken</p>
            )}
            {stationIdAvailability.available === true && (
              <p className="mt-1 text-sm text-green-600">Station ID is available</p>
            )}
          </div>
        </div>

        {/* Charger Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-white mb-1">
              Charger Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                getFieldError('name') ? 'border-red-500' : 'border-slate-400'
              }`}
              placeholder="e.g., Main Entrance Fast Charger"
              disabled={isSubmitting}
            />
            {getFieldError('name') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-bold text-white mb-1">
              Charger Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as ChargerType)}
              className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isSubmitting}
            >
              {chargerTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-white mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Brief description of the charger"
            disabled={isSubmitting}
          />
        </div>

        {/* Manufacturer Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="manufacturer" className="block text-sm font-bold text-white mb-1">
              Manufacturer *
            </label>
            <input
              type="text"
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                getFieldError('manufacturer') ? 'border-red-500' : 'border-slate-400'
              }`}
              placeholder="e.g., ABB, ChargePoint"
              disabled={isSubmitting}
            />
            {getFieldError('manufacturer') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('manufacturer')}</p>
            )}
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-bold text-white mb-1">
              Model *
            </label>
            <input
              type="text"
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                getFieldError('model') ? 'border-red-500' : 'border-slate-400'
              }`}
              placeholder="e.g., Terra 184, CT4021"
              disabled={isSubmitting}
            />
            {getFieldError('model') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('model')}</p>
            )}
          </div>

          <div>
            <label htmlFor="serialNumber" className="block text-sm font-bold text-white mb-1">
              Serial Number *
            </label>
            <input
              type="text"
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                getFieldError('serialNumber') ? 'border-red-500' : 'border-slate-400'
              }`}
              placeholder="e.g., ABB-TF184-2024-001"
              disabled={isSubmitting}
            />
            {getFieldError('serialNumber') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('serialNumber')}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firmwareVersion" className="block text-sm font-bold text-white mb-1">
              Firmware Version
            </label>
            <input
              type="text"
              id="firmwareVersion"
              value={formData.firmwareVersion}
              onChange={(e) => handleInputChange('firmwareVersion', e.target.value)}
              className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 2.1.4"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="maxPower" className="block text-sm font-bold text-white mb-1">
              Max Power (kW) *
            </label>
            <input
              type="number"
              id="maxPower"
              value={formData.maxPower}
              onChange={(e) => handleInputChange('maxPower', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                getFieldError('maxPower') ? 'border-red-500' : 'border-slate-400'
              }`}
              placeholder="e.g., 22, 50, 150"
              min="0"
              step="0.1"
              disabled={isSubmitting}
            />
            {getFieldError('maxPower') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('maxPower')}</p>
            )}
          </div>
        </div>

        {/* Connectors */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Connectors</h3>
            <button
              type="button"
              onClick={addConnector}
              className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              Add Connector
            </button>
          </div>
          
          {formData.connectors.map((connector, index) => (
            <div key={index} className="border border-slate-500 bg-slate-700/50 rounded-md p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Connector {index + 1}</h4>
                {formData.connectors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeConnector(index)}
                    className="text-red-600 hover:text-red-700"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-1">
                    Connector Type
                  </label>
                  <select
                    value={connector.type}
                    onChange={(e) => handleConnectorChange(index, 'type', e.target.value as ConnectorType)}
                    className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={isSubmitting}
                  >
                    {connectorTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-1">
                    Max Power (kW)
                  </label>
                  <input
                    type="number"
                    value={connector.maxPower}
                    onChange={(e) => handleConnectorChange(index, 'maxPower', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    step="0.1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          ))}
          {getFieldError('connectors') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('connectors')}</p>
          )}
        </div>

        {/* Location Information */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Location Information</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-bold text-white mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                value={formData.location.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  getFieldError('location.address') ? 'border-red-500' : 'border-slate-400'
                }`}
                placeholder="e.g., 123 Electric Avenue"
                disabled={isSubmitting}
              />
              {getFieldError('location.address') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('location.address')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-bold text-white mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    getFieldError('location.city') ? 'border-red-500' : 'border-slate-400'
                  }`}
                  placeholder="San Francisco"
                  disabled={isSubmitting}
                />
                {getFieldError('location.city') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('location.city')}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-bold text-white mb-1">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  value={formData.location.state}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="CA"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-bold text-white mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  value={formData.location.zipCode}
                  onChange={(e) => handleLocationChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="94102"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-bold text-white mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={formData.location.country}
                  onChange={(e) => handleLocationChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="USA"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-bold text-white mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  value={formData.location.latitude}
                  onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="37.7749"
                  step="any"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-bold text-white mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  value={formData.location.longitude}
                  onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="-122.4194"
                  step="any"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Installation Date */}
        <div>
          <label htmlFor="installationDate" className="block text-sm font-bold text-white mb-1">
            Installation Date
          </label>
          <input
            type="date"
            id="installationDate"
            value={formData.installationDate}
            onChange={(e) => handleInputChange('installationDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-400 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-600">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-600 border border-slate-500 rounded-md hover:bg-slate-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 disabled:bg-emerald-400"
            disabled={isSubmitting || chargerIdAvailability.available === false || stationIdAvailability.available === false}
          >
            {isSubmitting ? 'Adding Charger...' : 'Add Charger'}
          </button>
        </div>

        {/* Form Error */}
        {getFieldError('form') && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{getFieldError('form')}</p>
          </div>
        )}
      </form>
    </div>
  );
};
