trigger DSP_LeadTrigger on Lead (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    DSP_BaseService_541.ServiceConfig config =
        new DSP_BaseService_541.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            DSP_Domain_548 domain =
                new DSP_Domain_548();
            DSP_Domain_548.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (DSP_Domain_548.ValidationError err : validation.errors) {
                    if (err.severity == DSP_Domain_548.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        DSP_RecordService_543 service =
            new DSP_RecordService_543();
        DSP_BaseService_541.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'DSP trigger error: ' + error);
            }
        }
    }
}
