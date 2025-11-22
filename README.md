## 사용법
* 다운로드 크롬 확장 프로그램
   * https://www.tampermonkey.net/
* user script add
   * copy
* 북토끼 제목 및 화 부분에 접근.


## Linux/MacOs 파일 합치기
* 단순 합치기 ( 혹시나 다음 개행이 안될수 있다. )
   * cat $(ls | sort) > 통합.txt
* 구분자 한줄 추가
<pre>
for f in $(ls *.txt | sort); do
  cat "$f"
  echo 
  echo 
done > 통합.txt
</pre>

## 윈도우 CMD 파일 합치기
* 단순 합치기 ( 혹시나 다음 개행이 안될수 있다. )
   * copy /b *.txt 통합.txt
* 구분자 한줄 추가 ( 아래 복사하고 bat로 이름 바궈 실행? )
<pre>
for %%f in (*.txt) do (
    type "%%f" >> book.txt
    echo. >> book.txt REM newline1
	echo. >> book.txt REM newline2
)
</pre>

## 윈도우 power shell
* 단순 합치기 ( 혹시나 다음 개행이 안될수 있다. )
   * Get-Content *.txt | Out-File 통합.txt
* 구분자 한줄 추가
<pre>
  Get-ChildItem *.txt | Sort-Object Name | ForEach-Object {
    Get-Content $_
    "`n"
} | Out-File 통합.txt -Encoding UTF8
</pre>
 
