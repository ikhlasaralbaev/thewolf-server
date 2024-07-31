import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/hooks/store-hooks'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import QuestionItem from '../components/question-item'
import { completeStepAction, createResult } from '../store/candidate.actions'
import { ICreateResult } from '../types'

const CandidateStepTestsPageComponent = () => {
	const {
		test,
		candidate,
		currentStep: currentStepIndex,
		answers,
		stepResults,
	} = useAppSelector(state => state.candidate)

	const [currentStep, setCurrentStep] = useState(
		test?.steps[currentStepIndex || 0]
	)

	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	useEffect(() => {
		if (typeof currentStep === 'number') {
			setCurrentStep(test?.steps?.[currentStepIndex || 0])
		}
	}, [currentStepIndex])

	const handleCompleteStep = () => {
		console.log({
			step_id: currentStep?.id!,
			candidate_id: candidate?.id!,
			answers: answers.map(item => ({
				question_id: +item.question_id!,
				answers: item.answers.map(item => Number(item)),
			})),
		})
		dispatch(
			completeStepAction({
				step_id: currentStep?.id!,
				candidate_id: candidate?.id!,
				answers: answers.map(item => ({
					question_id: +item.question_id!,
					answers: item.answers.map(item => Number(item)),
				})),
			})
		).then((res: any) => {
			if (res.type === 'candidate/complete-step/fulfilled') {
				toast.success('Malumotlar yuborildi.')
				if (!res?.payload?.isPassed) {
					navigate('/no-passed', { replace: true })
				} else {
					if (test?.steps.length === currentStepIndex! + 1) {
						const totalStepResults = [...stepResults, res.payload]

						const totalQuestionsArr = totalStepResults.map(
							item => item.totalQuestions
						)
						const totalCorrectAnswersArr = totalStepResults.map(
							item => item.correctAnswers
						)
						const totalCorrectAnswersInPercent = totalStepResults.map(
							item => item.resultInPercent
						)

						const totalQuestions = totalQuestionsArr.reduce(
							(prev, curr) => prev + curr,
							0
						)
						const totalCorrectAnswers = totalCorrectAnswersArr.reduce(
							(prev, curr) => prev + curr,
							0
						)
						const totalInPercent =
							totalCorrectAnswersInPercent.reduce(
								(prev, curr) => prev! + curr!,
								0
							) / totalCorrectAnswersInPercent.length

						const result: ICreateResult = {
							correctAnswers: totalCorrectAnswers,
							correctAnswersInPercent: Math.round(totalInPercent),
							candidate: candidate?.id!,
							test: test.id,
							totalQuestions,
						}

						dispatch(createResult(result))
							.then(res => {
								if (res.type === 'candidate/create-result/fulfilled') {
									navigate('/passed', { replace: true })
								}
							})
							.catch(() => {
								toast.error('Something went wrong!')
							})
					} else {
						navigate('/next-step', { replace: true })
					}
				}
			}
		})
	}

	return (
		<div>
			<div className='flex flex-col items-center justify-center mt-5 mb-[45px]'>
				<h1 className='font-bold text-[20px]'>
					{currentStepIndex! + 1} - Step
				</h1>
				<span>{currentStep?.title}</span>
			</div>

			{currentStep?.questions.map((item, index) => (
				<QuestionItem question={item} index={index} key={item.id} />
			))}

			<div className='flex justify-center mt-12 mb-24'>
				<Button className='mx-auto' onClick={handleCompleteStep}>
					Проверить результаты
				</Button>
			</div>
		</div>
	)
}

export default CandidateStepTestsPageComponent
