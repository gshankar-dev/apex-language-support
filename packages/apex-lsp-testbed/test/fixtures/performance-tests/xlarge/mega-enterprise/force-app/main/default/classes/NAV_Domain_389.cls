public inherited sharing class NAV_Domain_389 {

    public enum ValidationSeverity { ERROR_SEVERITY, WARNING, INFO }

    public enum FieldChangeType { CREATED, UPDATED, CLEARED, UNCHANGED }

    public class FieldChange {
        public String fieldName { get; private set; }
        public Object oldValue { get; private set; }
        public Object newValue { get; private set; }
        public FieldChangeType changeType { get; private set; }

        public FieldChange(String fieldName, Object oldValue, Object newValue) {
            this.fieldName = fieldName;
            this.oldValue = oldValue;
            this.newValue = newValue;
            if (oldValue == null && newValue != null) {
                this.changeType = FieldChangeType.CREATED;
            } else if (oldValue != null && newValue == null) {
                this.changeType = FieldChangeType.CLEARED;
            } else if (oldValue != newValue) {
                this.changeType = FieldChangeType.UPDATED;
            } else {
                this.changeType = FieldChangeType.UNCHANGED;
            }
        }

        public Boolean isSignificant() {
            return this.changeType != FieldChangeType.UNCHANGED;
        }
    }

    public class ValidationError {
        public String fieldName { get; private set; }
        public String message { get; private set; }
        public ValidationSeverity severity { get; private set; }
        public Map<String, String> context { get; private set; }

        public ValidationError(String fieldName, String message) {
            this.fieldName = fieldName;
            this.message = message;
            this.severity = ValidationSeverity.ERROR_SEVERITY;
            this.context = new Map<String, String>();
        }

        public ValidationError withSeverity(ValidationSeverity sev) {
            this.severity = sev;
            return this;
        }

        public ValidationError withContext(String key, String value) {
            this.context.put(key, value);
            return this;
        }
    }

    public class DomainResult {
        public List<ValidationError> errors { get; private set; }
        public Map<Id, List<FieldChange>> changesByRecord { get; private set; }
        public Boolean isValid { get { return this.errors.isEmpty() || !hasBlockingErrors(); } }

        public DomainResult() {
            this.errors = new List<ValidationError>();
            this.changesByRecord = new Map<Id, List<FieldChange>>();
        }

        public DomainResult addError(ValidationError error) {
            this.errors.add(error);
            return this;
        }

        public DomainResult trackChanges(Id recordId, List<FieldChange> changes) {
            this.changesByRecord.put(recordId, changes);
            return this;
        }

        private Boolean hasBlockingErrors() {
            for (ValidationError err : this.errors) {
                if (err.severity == ValidationSeverity.ERROR_SEVERITY) {
                    return true;
                }
            }
            return false;
        }
    }

    public DomainResult validate(List<Case> records, Map<Id, Case> oldMap) {
        DomainResult result = new DomainResult();
        Set<String> uniqueValues = new Set<String>();

        for (Case record : records) {
            Case oldRecord = oldMap != null && record.Id != null ? oldMap.get(record.Id) : null;
            List<FieldChange> changes = new List<FieldChange>();

            for (String field : record.getPopulatedFieldsAsMap().keySet()) {
                Object newVal = record.get(field);
                Object oldVal = oldRecord != null ? oldRecord.get(field) : null;
                FieldChange fc = new FieldChange(field, oldVal, newVal);
                if (fc.isSignificant()) {
                    changes.add(fc);
                }
            }

            if (record.Id != null) {
                result.trackChanges(record.Id, changes);
            }

            String nameField = (String) record.get('Name');
            if (nameField != null) {
                if (nameField.length() > 255) {
                    result.addError(
                        new ValidationError('Name', 'Name exceeds maximum length')
                            .withSeverity(ValidationSeverity.ERROR_SEVERITY)
                            .withContext('maxLength', '255')
                            .withContext('actualLength', String.valueOf(nameField.length()))
                    );
                }
                String normalizedName = nameField.toLowerCase().trim();
                if (uniqueValues.contains(normalizedName)) {
                    result.addError(
                        new ValidationError('Name', 'Duplicate name detected: ' + nameField)
                            .withSeverity(ValidationSeverity.WARNING)
                    );
                }
                uniqueValues.add(normalizedName);
            }
        }
        return result;
    }
}
