enum EmployeeRole {
	NURSE = 'NURSE',
	PHARMACIST = 'PHARMACIST',
	IT = 'IT',
	ADMIN = 'ADMIN',
	COMMONER = 'COMMONER',
}

enum TransactionType {
	IN = 'IN',
	OUT = 'OUT',
}

enum ValidationStatus {
	SUSPECT = 'SUSPECT',
	NORMAL = 'NORMAL',
	UNVERIFIED = 'UNVERIFIED',
}

enum LogLevel {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARNING = 'WARNING',
	ERROR = 'ERROR',
}

enum LogEvent {
	PYXIS = 'PYXIS',
	BACKEND = 'BACKEND',
	DATABASE = 'DATABASE',
	TRANSACTION = 'TRANSACTION',
	INVENTORY = 'INVENTORY',
	EMPLOYEE = 'EMPLOYEE',
	PATIENT = 'PATIENT',
	MEDICINE = 'MEDICINE',
	VALIDATION = 'VALIDATION',
}

enum PyxisReportType {
	DATA_INCONSISTENCY = 'DATA_INCONSISTENCY',
	NEEDS_REFILL = 'NEEDS_REFILL',
	TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
	OTHER = 'OTHER',
}

enum ReportStatus {
	SENT = 'SENT',
	RECEIVED = 'RECEIVED',
	PENDING = 'PENDING',
	FINISHED = 'FINISHED',
}

enum PatientReportType {
	NOT_CONSUMED = 'NOT_CONSUMED',
	QUANTITY_MISMATCH = 'QUANTITY_MISMATCH',
	OTHER = 'OTHER',
}

interface Patient {
	uuid: string;
	name: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

interface Employee {
	uuid: string;
	role: EmployeeRole;
	name: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

interface MedicineName {
	name: string;
	createdAt: Date;
}

interface Medicine {
	id: string;
	MedicineNames: MedicineName[];
	createdAt: Date;
	updatedAt: Date;
}

interface Transaction {
	uuid: string;
	type: TransactionType;
	employeeUuid: string;
	patientUuid: string;
	medicineId: string;
	quantity: number;
	validationUuid: string;
	createdAt: Date;
}

interface OverriddenTransaction {
	uuid: string;
	employeeUuid: string;
	validationUuid: string;
	overrideReason: string;
	createdAt: Date;
}

interface Validation {
	uuid: string;
	openTime: number;
	override: boolean;
	supposedQuantity: number;
	patientAcceptance: boolean;
	createdAt: Date;
	status: ValidationStatus;
}

interface Pyxis {
	uuid: string;
	floor: number;
	block: string;
	extra_data: any;
	createdAt: Date;
}

interface Inventory {
	pyxisUuid: string;
	medicineId: string;
	quantity: number;
	createdAt: Date;
	updatedAt: Date;
}

interface Log {
	cuid: string;
	level: LogLevel;
	event: LogEvent;
	data: any;
	createdAt: Date;
}

interface PyxisReport {
	cuid: string;
	pyxisUuid: string;
	employeeUuid: string;
	medicineId: string;
	type: PyxisReportType;
	observation: string;
	urgency: boolean;
}

interface PatientReport {
	cuid: string;
	patientUuid: string;
	transactionUuid: string;
	status: ReportStatus;
	type: PatientReportType;
	observation: string;
}

export type {
	Patient,
	Employee,
	MedicineName,
	Medicine,
	Transaction,
	OverriddenTransaction,
	Validation,
	Pyxis,
	Inventory,
	Log,
	PyxisReport,
	PatientReport,
	EmployeeRole,
	TransactionType,
	ValidationStatus,
	LogLevel,
	LogEvent,
	PyxisReportType,
	ReportStatus,
	PatientReportType,
};
