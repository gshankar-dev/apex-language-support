trigger BGD_ContactTrigger on Contact (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    BGD_BaseService_521.ServiceConfig config =
        new BGD_BaseService_521.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            BGD_Domain_528 domain =
                new BGD_Domain_528();
            BGD_Domain_528.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (BGD_Domain_528.ValidationError err : validation.errors) {
                    if (err.severity == BGD_Domain_528.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        BGD_RecordService_523 service =
            new BGD_RecordService_523();
        BGD_BaseService_521.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'BGD trigger error: ' + error);
            }
        }
    }
}
