import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Auto Insurance',
      description: 'Comprehensive coverage for your vehicles with instant claims processing',
      features: ['Accident Coverage', 'Theft Protection', 'Liability Insurance', 'Instant Claims'],
      price: 'From $50/month',
      color: 'from-blue-500 to-blue-600',
      icon: '🚗'
    },
    {
      id: 2,
      title: 'Health Insurance',
      description: 'Healthcare coverage with transparent pricing and fast claim settlements',
      features: ['Medical Coverage', 'Dental Care', 'Vision Care', 'Prescription Drugs'],
      price: 'From $80/month',
      color: 'from-green-500 to-green-600',
      icon: '🏥'
    },
    {
      id: 3,
      title: 'Property Insurance',
      description: 'Protect your home and belongings with blockchain-verified coverage',
      features: ['Home Protection', 'Natural Disasters', 'Personal Property', 'Liability Coverage'],
      price: 'From $40/month',
      color: 'from-purple-500 to-purple-600',
      icon: '🏠'
    },
    {
      id: 4,
      title: 'Life Insurance',
      description: 'Secure your family\'s future with transparent and reliable coverage',
      features: ['Death Benefit', 'Cash Value', 'Flexible Premiums', 'Family Protection'],
      price: 'From $30/month',
      color: 'from-red-500 to-red-600',
      icon: '🛡️'
    },
    {
      id: 5,
      title: 'Business Insurance',
      description: 'Comprehensive coverage for businesses of all sizes',
      features: ['General Liability', 'Professional Liability', 'Property Coverage', 'Cyber Insurance'],
      price: 'From $100/month',
      color: 'from-yellow-500 to-yellow-600',
      icon: '💼'
    },
    {
      id: 6,
      title: 'Travel Insurance',
      description: 'Travel with confidence knowing you\'re protected worldwide',
      features: ['Trip Cancellation', 'Medical Coverage', 'Baggage Protection', 'Emergency Assistance'],
      price: 'From $20/trip',
      color: 'from-pink-500 to-pink-600',
      icon: '✈️'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white w-full">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg cursor-pointer hover:scale-105 transition-transform"></div>
              </Link>
              <span className="text-xl font-bold">EthSure</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Link to="/services" className="text-white font-medium">Services</Link>
              <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Our <span className="bg-gradient-to-r from-blue-400 to-green-600 bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive insurance solutions powered by blockchain technology. 
            Get the coverage you need with transparency, security, and speed.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-full mx-auto mb-4 flex items-center justify-center text-3xl`}>
                  {service.icon}
                </div>
                <CardTitle className="text-white text-xl">{service.title}</CardTitle>
                <CardDescription className="text-gray-300">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-white font-bold text-lg mb-4">{service.price}</p>
                  <Link to={`/service/${service.id}`}>
                    <Button className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90`}>
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Services?</h2>
          <p className="text-xl text-gray-300">The advantages of blockchain-powered insurance</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-gray-800/50 border-gray-700 text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Claims</h3>
              <p className="text-gray-300 text-sm">
                Get your claims processed instantly through smart contracts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Transparency</h3>
              <p className="text-gray-300 text-sm">
                All transactions are recorded on the blockchain for complete transparency
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Security</h3>
              <p className="text-gray-300 text-sm">
                Advanced security through blockchain technology and smart contracts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-red-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lower Costs</h3>
              <p className="text-gray-300 text-sm">
                Reduced premiums through elimination of intermediaries
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">Choose the perfect insurance plan for your needs</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                Get Coverage Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-4">
                Speak to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
