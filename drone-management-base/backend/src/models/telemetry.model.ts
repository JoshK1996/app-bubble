import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a telemetry document in MongoDB
 */
export interface ITelemetry extends Document {
  droneId: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
  };
  attitude: {
    roll: number;
    pitch: number;
    yaw: number;
  };
  speed: {
    horizontal: number;
    vertical: number;
  };
  batteryStatus: {
    percentage: number;
    voltage: number;
    current: number;
    temperature: number;
  };
  signalStrength: number;
  status: {
    flightMode: string;
    isFlying: boolean;
    isArmed: boolean;
    errorCodes: string[];
  };
  sensors: {
    gps: {
      satellites: number;
      fix: number;
      hdop: number;
    };
    imu: {
      accelerometer: {
        x: number;
        y: number;
        z: number;
      };
      gyroscope: {
        x: number;
        y: number;
        z: number;
      };
      magnetometer: {
        x: number;
        y: number;
        z: number;
      };
      temperature: number;
    };
    barometer: {
      pressure: number;
      temperature: number;
      altitude: number;
    };
  };
  missionId?: string;
  waypoint?: {
    id: string;
    index: number;
  };
  createdAt: Date;
}

/**
 * Mongoose schema for drone telemetry data
 * This schema is optimized for high-frequency time-series data
 */
const TelemetrySchema = new Schema<ITelemetry>(
  {
    droneId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      altitude: {
        type: Number,
        required: true,
      },
      accuracy: {
        type: Number,
        default: 0,
      },
    },
    attitude: {
      roll: {
        type: Number,
        required: true,
      },
      pitch: {
        type: Number,
        required: true,
      },
      yaw: {
        type: Number,
        required: true,
      },
    },
    speed: {
      horizontal: {
        type: Number,
        default: 0,
      },
      vertical: {
        type: Number,
        default: 0,
      },
    },
    batteryStatus: {
      percentage: {
        type: Number,
        required: true,
      },
      voltage: {
        type: Number,
        default: 0,
      },
      current: {
        type: Number,
        default: 0,
      },
      temperature: {
        type: Number,
        default: 0,
      },
    },
    signalStrength: {
      type: Number,
      default: 0,
    },
    status: {
      flightMode: {
        type: String,
        required: true,
      },
      isFlying: {
        type: Boolean,
        default: false,
      },
      isArmed: {
        type: Boolean,
        default: false,
      },
      errorCodes: {
        type: [String],
        default: [],
      },
    },
    sensors: {
      gps: {
        satellites: {
          type: Number,
          default: 0,
        },
        fix: {
          type: Number,
          default: 0,
        },
        hdop: {
          type: Number,
          default: 0,
        },
      },
      imu: {
        accelerometer: {
          x: {
            type: Number,
            default: 0,
          },
          y: {
            type: Number,
            default: 0,
          },
          z: {
            type: Number,
            default: 0,
          },
        },
        gyroscope: {
          x: {
            type: Number,
            default: 0,
          },
          y: {
            type: Number,
            default: 0,
          },
          z: {
            type: Number,
            default: 0,
          },
        },
        magnetometer: {
          x: {
            type: Number,
            default: 0,
          },
          y: {
            type: Number,
            default: 0,
          },
          z: {
            type: Number,
            default: 0,
          },
        },
        temperature: {
          type: Number,
          default: 0,
        },
      },
      barometer: {
        pressure: {
          type: Number,
          default: 0,
        },
        temperature: {
          type: Number,
          default: 0,
        },
        altitude: {
          type: Number,
          default: 0,
        },
      },
    },
    missionId: {
      type: String,
      index: true,
    },
    waypoint: {
      id: {
        type: String,
      },
      index: {
        type: Number,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indices for common query patterns
TelemetrySchema.index({ droneId: 1, timestamp: -1 });
TelemetrySchema.index({ missionId: 1, timestamp: -1 });

// Create geospatial index for location-based queries
TelemetrySchema.index({
  'location.longitude': 1,
  'location.latitude': 1,
});

/**
 * Mongoose model for drone telemetry data
 */
export const TelemetryModel = mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);

export default TelemetryModel; 