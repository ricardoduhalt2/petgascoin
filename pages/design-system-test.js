import React from 'react';

export default function DesignSystemTest() {
  return (
    <div className="min-h-screen p-8" style={{backgroundColor: 'var(--petgas-black)'}}>
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="petgas-gradient-text-animated petgas-text-6xl petgas-font-black mb-4">
            PetGasCoin Design System
          </h1>
          <p className="text-petgas-text-gray petgas-text-lg">
            Testing the comprehensive design system foundation
          </p>
        </div>

        {/* Typography Scale */}
        <section className="space-y-6">
          <h2 className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
            Typography Scale
          </h2>
          <div className="space-y-4">
            <div className="petgas-text-9xl petgas-font-black text-petgas-gold">9XL - Heading</div>
            <div className="petgas-text-8xl petgas-font-extrabold text-petgas-gold-light">8XL - Heading</div>
            <div className="petgas-text-7xl petgas-font-bold text-petgas-goldenrod">7XL - Heading</div>
            <div className="petgas-text-6xl petgas-font-bold text-petgas-amber">6XL - Heading</div>
            <div className="petgas-text-5xl petgas-font-semibold text-petgas-orange">5XL - Heading</div>
            <div className="petgas-text-4xl petgas-font-semibold text-petgas-text-white">4XL - Heading</div>
            <div className="petgas-text-3xl petgas-font-medium text-petgas-text-light">3XL - Heading</div>
            <div className="petgas-text-2xl petgas-font-medium text-petgas-text-gray">2XL - Heading</div>
            <div className="petgas-text-xl petgas-font-regular text-petgas-text-muted">XL - Body Large</div>
            <div className="petgas-text-lg petgas-font-regular text-petgas-text-white">LG - Body</div>
            <div className="petgas-text-base petgas-font-regular text-petgas-text-light">Base - Body</div>
            <div className="petgas-text-sm petgas-font-light text-petgas-text-gray">SM - Small</div>
            <div className="petgas-text-xs petgas-font-light text-petgas-text-muted">XS - Caption</div>
          </div>
        </section>

        {/* Font Weights */}
        <section className="space-y-6">
          <h2 className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
            Font Weights
          </h2>
          <div className="space-y-2">
            <div className="petgas-text-2xl petgas-font-thin text-petgas-text-white">Thin (100)</div>
            <div className="petgas-text-2xl petgas-font-extralight text-petgas-text-white">Extra Light (200)</div>
            <div className="petgas-text-2xl petgas-font-light text-petgas-text-white">Light (300)</div>
            <div className="petgas-text-2xl petgas-font-regular text-petgas-text-white">Regular (400)</div>
            <div className="petgas-text-2xl petgas-font-medium text-petgas-text-white">Medium (500)</div>
            <div className="petgas-text-2xl petgas-font-semibold text-petgas-text-white">Semibold (600)</div>
            <div className="petgas-text-2xl petgas-font-bold text-petgas-text-white">Bold (700)</div>
            <div className="petgas-text-2xl petgas-font-extrabold text-petgas-text-white">Extra Bold (800)</div>
            <div className="petgas-text-2xl petgas-font-black text-petgas-text-white">Black (900)</div>
          </div>
        </section>

        {/* Gradient Text Variations */}
        <section className="space-y-6">
          <h2 className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
            Gradient Text System
          </h2>
          <div className="space-y-4">
            <div className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
              Static Gradient Text
            </div>
            <div className="petgas-gradient-text-animated petgas-text-4xl petgas-font-bold">
              Animated Gradient Text with Golden Shine
            </div>
            <div className="petgas-gradient-text-primary petgas-text-4xl petgas-font-bold">
              Primary Gradient Variation
            </div>
            <div className="petgas-gradient-text-secondary petgas-text-4xl petgas-font-bold">
              Secondary Gradient Variation
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-16 bg-petgas-gold rounded-lg"></div>
              <p className="text-petgas-text-white petgas-text-sm">Gold</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-petgas-gold-light rounded-lg"></div>
              <p className="text-petgas-text-white petgas-text-sm">Gold Light</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-petgas-gold-dark rounded-lg"></div>
              <p className="text-petgas-text-white petgas-text-sm">Gold Dark</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-petgas-goldenrod rounded-lg"></div>
              <p className="text-petgas-text-white petgas-text-sm">Goldenrod</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-petgas-amber rounded-lg"></div>
              <p className="text-petgas-text-white petgas-text-sm">Amber</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-petgas-orange rounded-lg"></div>
              <p className="text-petgas-text-white petgas-text-sm">Orange</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-petgas-dark rounded-lg border border-petgas-gray"></div>
              <p className="text-petgas-text-white petgas-text-sm">Dark</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-petgas-gray rounded-lg"></div>
              <p className="text-petgas-text-white petgas-text-sm">Gray</p>
            </div>
          </div>
        </section>

        {/* Gradient Backgrounds */}
        <section className="space-y-6">
          <h2 className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
            Gradient Backgrounds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-petgas-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-petgas-black petgas-font-bold petgas-text-lg">Primary Gradient</span>
            </div>
            <div className="h-32 bg-petgas-gradient-secondary rounded-lg flex items-center justify-center">
              <span className="text-petgas-black petgas-font-bold petgas-text-lg">Secondary Gradient</span>
            </div>
            <div className="h-32 bg-petgas-gradient-button rounded-lg flex items-center justify-center">
              <span className="text-petgas-black petgas-font-bold petgas-text-lg">Button Gradient</span>
            </div>
            <div className="h-32 bg-petgas-gradient-radial rounded-lg flex items-center justify-center">
              <span className="text-petgas-black petgas-font-bold petgas-text-lg">Radial Gradient</span>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-6">
          <h2 className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
            Animation System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-petgas-dark p-6 rounded-lg text-center">
              <div className="petgas-text-2xl petgas-font-bold text-petgas-gold animate-petgas-shine">
                Shine Animation
              </div>
            </div>
            <div className="bg-petgas-dark p-6 rounded-lg text-center">
              <div className="petgas-text-2xl petgas-font-bold text-petgas-gold animate-petgas-pulse-glow">
                Pulse Glow
              </div>
            </div>
            <div className="bg-petgas-dark p-6 rounded-lg text-center">
              <div className="petgas-text-2xl petgas-font-bold text-petgas-gold animate-petgas-float">
                Float Animation
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Typography Test */}
        <section className="space-y-6">
          <h2 className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
            Responsive Typography
          </h2>
          <div className="space-y-4">
            <div className="petgas-responsive-text-5xl petgas-font-bold text-petgas-gold">
              Responsive 5XL - Scales with screen size
            </div>
            <div className="petgas-responsive-text-3xl petgas-font-semibold text-petgas-goldenrod">
              Responsive 3XL - Mobile-first approach
            </div>
            <div className="petgas-responsive-text-xl petgas-font-regular text-petgas-text-white">
              Responsive XL - Adapts to viewport
            </div>
          </div>
        </section>

        {/* Spacing System */}
        <section className="space-y-6">
          <h2 className="petgas-gradient-text petgas-text-4xl petgas-font-bold">
            Spacing System
          </h2>
          <div className="space-y-4">
            <div className="bg-petgas-dark rounded-lg">
              <div className="bg-petgas-gold h-4 rounded-lg" style={{width: 'var(--petgas-space-4)'}}></div>
              <p className="text-petgas-text-white petgas-text-sm mt-2">Space 4 (16px)</p>
            </div>
            <div className="bg-petgas-dark rounded-lg">
              <div className="bg-petgas-gold h-4 rounded-lg" style={{width: 'var(--petgas-space-8)'}}></div>
              <p className="text-petgas-text-white petgas-text-sm mt-2">Space 8 (32px)</p>
            </div>
            <div className="bg-petgas-dark rounded-lg">
              <div className="bg-petgas-gold h-4 rounded-lg" style={{width: 'var(--petgas-space-16)'}}></div>
              <p className="text-petgas-text-white petgas-text-sm mt-2">Space 16 (64px)</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-petgas-gray">
          <p className="text-petgas-text-muted petgas-text-sm">
            PetGasCoin Design System Foundation - Complete ✅
          </p>
        </div>

      </div>
    </div>
  );
}