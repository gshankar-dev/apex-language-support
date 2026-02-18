trigger KPI_ContactTrigger on Contact (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    KPI_BaseService_351.ServiceConfig config =
        new KPI_BaseService_351.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            KPI_Domain_358 domain =
                new KPI_Domain_358();
            KPI_Domain_358.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (KPI_Domain_358.ValidationError err : validation.errors) {
                    if (err.severity == KPI_Domain_358.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        KPI_RecordService_353 service =
            new KPI_RecordService_353();
        KPI_BaseService_351.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'KPI trigger error: ' + error);
            }
        }
    }
}
