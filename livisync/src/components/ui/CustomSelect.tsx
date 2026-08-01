import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  style?: React.CSSProperties;
}

const DROPDOWN_MAX_HEIGHT = 240;
const DROPDOWN_MARGIN = 6;

export const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  style,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Open upward if not enough space below AND there's more space above
      setOpenUpward(
        spaceBelow < DROPDOWN_MAX_HEIGHT + DROPDOWN_MARGIN && spaceAbove > spaceBelow
      );
    }
    setIsOpen((prev) => !prev);
  };

  const triggerStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    background: 'var(--card)',
    border: '1px solid var(--border-solid)',
    borderRadius: '10px',
    color: 'var(--foreground)',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'var(--transition)',
    gap: '0.5rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
    ...style,
  };

  const listContainerStyle: React.CSSProperties = {
    position: 'absolute',
    ...(openUpward
      ? { bottom: `calc(100% + ${DROPDOWN_MARGIN}px)`, top: 'auto' }
      : { top: `calc(100% + ${DROPDOWN_MARGIN}px)`, bottom: 'auto' }),
    left: 0,
    right: 0,
    background: 'var(--card)',
    border: '1px solid var(--border-solid)',
    borderRadius: '12px',
    boxShadow: '0 12px 30px -10px rgba(30,34,33,0.08), 0 4px 12px -5px rgba(30,34,33,0.03)',
    zIndex: 200,
    padding: '0.35rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    maxHeight: `${DROPDOWN_MAX_HEIGHT}px`,
    overflowY: 'auto',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        style={{
          ...triggerStyle,
          borderColor: isOpen ? 'var(--primary)' : 'var(--border-solid)',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-glow)' : triggerStyle.boxShadow,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--muted)',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Options List */}
      {isOpen && (
        <div style={listContainerStyle}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.5rem 0.625rem',
                  fontSize: '0.825rem',
                  color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                  background: isSelected ? 'rgba(181, 92, 60, 0.04)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isSelected ? 600 : 500,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f2f1ec';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={13} style={{ color: 'var(--primary)' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
